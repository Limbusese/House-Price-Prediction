import fs from 'fs';
import csv from 'csv-parser';
import { stringify } from 'csv-stringify/sync';

class DataSplitter {
    constructor(inputFilePath, trainOutputPath, testOutputPath, splitRatio = 0.8) {
        this.inputFilePath = inputFilePath;
        this.trainOutputPath = trainOutputPath;
        this.testOutputPath = testOutputPath;
        this.splitRatio = splitRatio; // Default is 80% for training, 20% for testing
        this.results = [];
    }

    // Method to read and split the CSV data
    readAndSplitData() {
        fs.createReadStream(this.inputFilePath)
            .pipe(csv())
            .on('data', (row) => {
                this.results.push(row);
            })
            .on('end', () => {
                this.splitData();
            })
            .on('error', (error) => {
                console.error('Error while processing CSV:', error);
            });
    }

    // Method to split data into training and testing sets
    splitData() {
        const trainSize = Math.floor(this.splitRatio * this.results.length); // Split by the given ratio
        const trainData = this.results.slice(0, trainSize);
        const testData = this.results.slice(trainSize);

        this.saveData(trainData, this.trainOutputPath, 'Training');
        this.saveData(testData, this.testOutputPath, 'Testing');
    }

    // Method to save data into a CSV file
    saveData(data, outputPath, dataType) {
        const csvData = stringify(data, { header: true });
        fs.writeFileSync(outputPath, csvData);
        console.log(`${dataType} data saved to ${outputPath}`);
    }
}

// Example usage
const inputFilePath = '../dataSets/houseDatasets_normalized.csv'; // Path to your normalized CSV
const trainOutputPath = '../dataSets/houseDatasetstrain_data.csv'; // Path to save training dataSets
const testOutputPath = '../dataSets/houseDatasetstest_data.csv'; // Path to save testing data

// Create an instance of DataSplitter and start the process
const dataSplitter = new DataSplitter(inputFilePath, trainOutputPath, testOutputPath);
dataSplitter.readAndSplitData();
