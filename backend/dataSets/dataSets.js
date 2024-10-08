import fs from 'fs';
import csv from 'csv-parser';
import createCsvWriter from 'csv-writer';

// Define the common headers
const commonHeaders = ['location', 'roadSize', 'bedrooms', 'bathrooms', 'landarea', 'price', 'builtOn'];

// Function to clean data (remove rows with missing or unclear data)
function cleanRow(row) {
    for (const header of commonHeaders) {
        if (!row[header] || row[header].trim() === '') {
            return false; // Remove row if any feature is empty
        }
    }
    return true; // Row is clean
}

// Function to process a CSV file and filter based on required headers
async function processCsvFile(filePath, selectHeaders, renameMap) {
    return new Promise((resolve, reject) => {
        const results = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (row) => {
                const filteredRow = {};
                for (const [oldHeader, newHeader] of Object.entries(renameMap)) {
                    if (row[oldHeader]) {
                        filteredRow[newHeader] = row[oldHeader].trim(); // Trim spaces from values and rename headers
                    }
                }

                if (cleanRow(filteredRow)) {
                    results.push(filteredRow); // Keep only rows that are clean
                }
            })
            .on('end', () => {
                console.log(`Processed ${results.length} valid rows from ${filePath}`);
                resolve(results); // Return the processed rows
            })
            .on('error', (err) => {
                console.error(`Error reading file ${filePath}:`, err);
                reject(err);
            });
    });
}

// Main function to merge two CSV files and write to a new CSV file
async function mergeCsvFiles(file1, file2, outputFile) {
    // Define the headers to select and rename for each file
    const gharSansarRenameMap = {
        'location': 'location',
        'roadSize': 'roadSize',
        'beds': 'bedrooms',
        'bathrooms': 'bathrooms',
        'landArea': 'landarea',
        'price': 'price',
        'builtOn': 'builtOn'
    };

    const nepaliHouseRenameMap = {
        'LOCATION': 'location',
        'ROAD ACCESS': 'roadSize',
        'BEDROOM': 'bedrooms',
        'BATHROOM': 'bathrooms',
        'LAND AREA': 'landarea',
        'PRICE': 'price',
        'BUILT YEAR': 'builtOn'
    };

    try {
        // Process both CSV files
        const data1 = await processCsvFile(file1, Object.keys(gharSansarRenameMap), gharSansarRenameMap);
        const data2 = await processCsvFile(file2, Object.keys(nepaliHouseRenameMap), nepaliHouseRenameMap);

        // Merge the two datasets
        const mergedData = [...data1, ...data2];

        // Create the CSV writer
        const csvWriter = createCsvWriter.createObjectCsvWriter({
            path: outputFile,
            header: commonHeaders.map((header) => ({ id: header, title: header })),
        });

        // Check if there is data to write
        if (mergedData.length === 0) {
            console.error('No valid data found to write to the output CSV file.');
            return;
        }

        // Write the merged data to a new CSV file
        await csvWriter.writeRecords(mergedData);
        console.log(`Merged CSV file written to ${outputFile}`);
    } catch (error) {
        console.error('Error processing CSV files:', error);
    }
}

// File paths
const file1 = './gharSansar.csv'; // Path to your gharSansar CSV file
const file2 = './Nepali_House_Dataset.csv'; // Path to your Nepali_House_Dataset CSV file
const outputFile = './houseDataset.csv'; // Output file path

// Call the merge function
mergeCsvFiles(file1, file2, outputFile);
