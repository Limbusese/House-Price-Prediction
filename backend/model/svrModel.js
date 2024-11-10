import fs from "fs";
import csv from "csv-parser";
import SupportVectorRegression from "../model/svr.js";

class SVRModel {
    constructor(C = 1, epsilon = 0.1, gamma = 0.5) {
        this.C = C;
        this.epsilon = epsilon;
        this.gamma = gamma;
        this.alpha = [];
        this.b = 0;
        this.X_train = [];
    }

    // RBF kernel function
    rbfKernel(x1, x2) {
        if (!x1 || !x2) {
            throw new Error("x1 and x2 must not be undefined or null");
        }
    

        x1 = Array.isArray(x1) ? x1 : Array.from(x1);
        x2 = Array.isArray(x2) ? x2 : Array.from(x2);
    

        if (x1.length !== x2.length) {
            throw new Error("x1 and x2 must have the same length");
        }
    
        const distance = x1.reduce((sum, val, i) => sum + (val - x2[i]) ** 2, 0);
       
        return Math.exp(-this.gamma * distance);
    }
    
    

    // Method to load data from a CSV file
    loadCsvData(filePath) {
        return new Promise((resolve, reject) => {
            const data = [];
            fs.createReadStream(filePath)
                .pipe(csv())
                .on("data", (row) => {
                    data.push(Object.values(row).map(Number)); // Convert strings to numbers
                })
                .on("end", () => resolve(data))
                .on("error", (err) => reject(err));
        });
    }

    // Method to load X_train and alpha from CSV files
    async loadModelData(XTrainFile, alphaFile) {
        try {
            // Load X_train from the CSV file
            const X_train = await this.loadCsvData(XTrainFile);
            this.X_train = X_train; // Set X_train

            // Load alpha from the CSV file
            const alpha = await this.loadCsvData(alphaFile);
            this.alpha = alpha.map(row => row[0]); // Assuming alpha is in the first column

            console.log("Model data loaded successfully!");
        } catch (error) {
            console.error("Error loading model data:", error);
        }
    }

    // Predict the price using the trained model
    predictPrice(singleData) {
        console.log("Value singleData:", singleData);
    
        // Convert object to array
        const singleDataArray = [
            singleData.locationLat,
            singleData.locationLon,
            singleData.builtOn,
            singleData.bedrooms,
            singleData.bathrooms,
            singleData.landArea,
            singleData.roadSize
        ];
    
        // Validate input
        if (!Array.isArray(singleDataArray) || singleDataArray.length !== this.X_train[0].length) {
            throw new Error("Invalid input: singleData must be an array with the same number of features as training data.");
        }
    
        let result = this.b; // Start with the intercept
    
        for (let i = 0; i < this.alpha.length; i++) {
            if (Math.abs(this.alpha[i]) > 1e-6) {
                // Passing the array to rbfKernel
                const kernelValue = this.rbfKernel(singleDataArray, this.X_train[i]);
                result += this.alpha[i] * kernelValue; // Update result
            }
        }
    
        console.log("Final result is", result);
        return result;
    }
    
    
}

export default SVRModel;