import fs from 'fs';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';
import MinMaxCalculator from './minMaxNormalizer.js';

class CSVNormalizer {
    constructor() {
        this.minMaxCalculator = new MinMaxCalculator();
    }

    normalizeCSV(inputFilePath, outputFilePath, features) {
        const results = [];

        // Read CSV data
        fs.createReadStream(inputFilePath)
            .pipe(csv())
            .on('data', (row) => {
                results.push(row);
            })
            .on('end', () => {
                // Calculate min and max values
                this.minMaxCalculator.calculateMinMax(results, features);

                // Normalize each row
                const normalizedData = results.map(row => 
                    this.minMaxCalculator.normalizeRow(row, features)
                );

                // Save the normalized data to a new CSV file
                const csvData = stringify(normalizedData, { header: true });
                fs.writeFileSync(outputFilePath, csvData);
                console.log(`Normalized CSV data saved to ${outputFilePath}`);
            })
            .on('error', (error) => {
                console.error('Error processing CSV:', error);
            });
    }
}

export default CSVNormalizer;
