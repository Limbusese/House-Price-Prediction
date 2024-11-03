import fs from 'fs';
import csv from 'csv-parser';

export const countCSVRows = async (req, res) => {
    class CSVRowCounter {
        constructor(filePath) {
            this.filePath = filePath;
            console.log(filePath)
        }

        async countRows() {
            return new Promise((resolve, reject) => {
                let rowCount = 0;
                fs.createReadStream(this.filePath)
                    .pipe(csv())
                    .on('data', () => rowCount++)  // Count each row
                    .on('end', () => resolve(rowCount))
                    .on('error', (error) => reject(error));
            });
        }
    }


    try {
        const trainCounter = new CSVRowCounter("../backend/dataSets/trainDataSet/houseDatasetstrain_data_normalized.csv");
        const testCounter = new CSVRowCounter("../backend/dataSets/testDataSet/houseDatasetstest_data_normalized.csv");

        const [trainRowCount, testRowCount] = await Promise.all([
            trainCounter.countRows(),
            testCounter.countRows(),
        ]);

        res.json({
            trainDataRows: trainRowCount,
            testDataRows: testRowCount,
        });
    } catch (error) {
        console.error('Error reading CSV files:', error);
        res.status(500).json({ error: 'Failed to read CSV files' });
    }
};
