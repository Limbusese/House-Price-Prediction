import fs from 'fs';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';
import axios from 'axios';
import moment from 'moment';

class CSVProcessor {
    constructor(filePath) {
        this.filePath = filePath;
        this.results = [];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getGeocode(location) {
        const locationParts = location.split(',').map(part => part.trim());
        const locationString = locationParts.slice(0, 2).join(', ');
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}`;
        let retries = 3;
        const delayBetweenRetries = 1000;

        while (retries > 0) {
            try {
                await this.sleep(delayBetweenRetries);
                const response = await axios.get(url, { timeout: 10000 });
                if (response.data.length > 0) {
                    const { lat, lon } = response.data[0];
                    return { lat, lon };
                } else {
                    return { lat: null, lon: null };
                }
            } catch (error) {
                retries -= 1;
                if (retries === 0) {
                    return { lat: null, lon: null };
                }
            }
        }
    }

    convertRoadSize(roadSize) {
        if (roadSize.includes('Feet')) {
            return parseFloat(roadSize.replace('Feet', '').trim());
        }
        return parseFloat(roadSize);
    }

    convertLandArea(landArea) {
        landArea = landArea.trim();
        if (landArea.toLowerCase().includes('anna')) {
            if (landArea.toLowerCase().includes('dam')) {
                const [annaPart, damPart] = landArea.split('Anna');
                const annaValue = parseFloat(annaPart.trim());
                const damValue = parseFloat(damPart.replace('Dam', '').trim());
                return (annaValue * 342.25) + (damValue * 21.39);
            } else {
                return parseFloat(landArea.replace(/Anna/gi, '').trim()) * 342.25;
            }
        }
        if (landArea.match(/\d+[\.\-]\d+[\.\-]\d+[\.\-]\d+/)) {
            const [ropani, aana, paisa, daam] = landArea.split(/[\.\-]/).map(Number);
            return (ropani * 5476) + (aana * 342.25) + (paisa * 85.56) + (daam * 21.39);
        }
        if (landArea.match(/\d+[\.\-]\d+[\.\-]?\d*/)) {
            const parts = landArea.split(/[\.\-]/).map(Number);
            let aana = 0, paisa = 0, daam = 0;
            if (parts.length === 3) {
                [aana, paisa, daam] = parts;
            } else if (parts.length === 2) {
                [aana, paisa] = parts;
            } else if (parts.length === 1) {
                aana = parts[0];
            }
            return (aana * 342.25) + (paisa * 85.56) + (daam * 21.39);
        }
        if (landArea.toLowerCase().includes('dam')) {
            return parseFloat(landArea.replace(/Dam/gi, '').trim()) * 21.39;
        }
        return parseFloat(landArea);
    }

    convertPrice(price) {
        price = price.replace(/Rs\.?/gi, '').replace(/,/g, '').trim();
        if (/cr/i.test(price)) {
            return parseFloat(price.replace(/cr/i, '').trim()) * 10000000;
        }
        if (/lakhs/i.test(price)) {
            return parseFloat(price.replace(/lakhs/i, '').trim()) * 100000;
        }
        return parseFloat(price);
    }

    convertBuiltOn(builtOn) {
        const nepaliYear = parseInt(builtOn.replace('B.S.', '').trim());
        return nepaliYear - 57;
    }

    async processCSV() {
        const rows = [];
        const csvStream = fs.createReadStream(this.filePath)
            .pipe(csv());

        let rowCount = 0;

        for await (const row of csvStream) {
            rowCount++;
            const geocode = await this.getGeocode(row.location);
            if (geocode.lat && geocode.lon) {
                const convertedRow = {
                    locationLat: geocode.lat,
                    locationLon: geocode.lon,
                    roadSize: this.convertRoadSize(row.roadSize),
                    bedrooms: parseInt(row.bedrooms) || 0,
                    bathrooms: parseInt(row.bathrooms) || 0,
                    landArea: this.convertLandArea(row.landarea),
                    price: this.convertPrice(row.price),
                    builtOn: this.convertBuiltOn(row.builtOn)
                };
                 
                console.log(`Converted row #${rowCount}: ${JSON.stringify(convertedRow)}`);

                rows.push(convertedRow);
            }
        }
        
        console.log(`Finished processing all rows. Total rows processed: ${rowCount}`);

        this.saveProcessedData(rows);
    }

    saveProcessedData(rows) {
        const csvData = stringify(rows, { header: true });
        const newFilePath = this.filePath.replace('.csv', '_geocodedFile.csv');
        fs.writeFileSync(newFilePath, csvData);
        console.log(`CSV file successfully processed and saved as ${newFilePath}`);
    }
}

const csvFilePath = process.argv[2];

if (!csvFilePath) {
    console.error("Please provide a CSV file path as an argument.");
    process.exit(1);
}

const processor = new CSVProcessor(csvFilePath);
processor.processCSV();
