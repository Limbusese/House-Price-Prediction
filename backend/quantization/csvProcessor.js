import fs from 'fs';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';
import DataProcessor from './dataProcessor.js';

class CSVProcessor extends DataProcessor {
    constructor(filePath) {
        super();
        this.filePath = filePath;
        this.results = [];
    }

    async processCSV() {
        const rows = [];
        const csvStream = fs.createReadStream(this.filePath).pipe(csv());
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
                    builtOn: this.convertBuiltOn(row.builtOn),
                };
                console.log(`Converted row #${rowCount}: ${JSON.stringify(convertedRow)}`);
                rows.push(convertedRow);
            }
        }
        this.saveProcessedData(rows);
        console.log(`Finished processing all rows. Total rows processed: ${rowCount}`);
    }

    saveProcessedData(rows) {
        const csvData = stringify(rows, { header: true });
        const newFilePath = this.filePath.replace('.csv', '_processed.csv');
        fs.writeFileSync(newFilePath, csvData);
        console.log(`CSV file processed and saved as ${newFilePath}`);
    }
}

export default CSVProcessor;
