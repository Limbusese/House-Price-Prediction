import fs from 'fs';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';

class MinMaxNormalizer {
    constructor() {
        this.minMaxValues = {};
    }

    // Check undefined or missing fields and default them
    safeParseFloat(value) {
        return value ? parseFloat(value) : 0;
    }

    calculateMinMax(data, features) {
        features.forEach(feature => {
            this.minMaxValues[feature] = { min: Infinity, max: -Infinity };
        });

        data.forEach(row => {
            features.forEach(feature => {
                const value = this.safeParseFloat(row[feature]);
                if (value < this.minMaxValues[feature].min) this.minMaxValues[feature].min = value;
                if (value > this.minMaxValues[feature].max) this.minMaxValues[feature].max = value;
            });
        });
    }

    normalize(value, min, max) {
        return (value - min) / (max - min);
    }

    normalizeCSV(inputFilePath, outputFilePath, features) {
        const results = [];

        // Read and parse the CSV
        fs.createReadStream(inputFilePath)
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', () => {
                // Calculate min and max values for each feature
                this.calculateMinMax(results, features);

                // Normalize the data
                const normalizedData = results.map(row => {
                    const normalizedRow = {};

                    // Normalize latitude and longitude
                    const latitude = this.safeParseFloat(row['locationLat']);
                    const longitude = this.safeParseFloat(row['locationLon']);
                    normalizedRow['locationLat'] = this.normalize(latitude, this.minMaxValues['locationLat'].min, this.minMaxValues['locationLat'].max);
                    normalizedRow['locationLon'] = this.normalize(longitude, this.minMaxValues['locationLon'].min, this.minMaxValues['locationLon'].max);

                    // Normalize the other features
                    features.forEach(feature => {
                        if (feature !== 'locationLat' && feature !== 'locationLon') {
                            const value = this.safeParseFloat(row[feature]);
                            normalizedRow[feature] = this.normalize(value, this.minMaxValues[feature].min, this.minMaxValues[feature].max);
                        }
                    });

                    return normalizedRow;
                });

                // Save the normalized data to a new CSV file
                const csvData = stringify(normalizedData, { header: true });
                fs.writeFileSync(outputFilePath, csvData);
                console.log(`Normalized data saved to ${outputFilePath}`);
            })
            .on('error', (error) => {
                console.error('Error while processing CSV:', error);
            });
    }
}

// Example usage:
const normalizer = new MinMaxNormalizer();
const inputFilePath = '../dataSets/houseDataset_geocodedFile.csv';  // Path to input CSV
const outputFilePath = '../model/houseDatasets_normalized.csv';  // Path to save normalized data
const features = ['locationLat', 'locationLon', 'price', 'builtOn', 'bedrooms', 'bathrooms', 'landArea', 'roadSize'];

normalizer.normalizeCSV(inputFilePath, outputFilePath, features);
