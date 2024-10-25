import fs from 'fs';
import path from 'path';
import SVRModel from './SVRModel.js';
// import FileHandler from './FileHandler.js'; // Assuming this will be used for CSV handling later

class ModelManager {
    constructor() {
        this.svrModel = new SVRModel(); // The SVR model instance
    }

    // Main function to check input type and trigger appropriate actions
    async handleInput(input) {
        console.log("the handledInput is:", input);
    
        if (fs.existsSync(input) && input.endsWith('.csv')) {

            // CSV file detected, train the model
            console.log('CSV file detected. Training the model...');
            const data = FileHandler.readCSV(input);  // Ensure FileHandler is properly defined/imported
            this.svrModel.trainModel(data);
            return null; 
            
        } else if (typeof input === 'object') {
            console.log('Single-row data detected. Predicting price...');
        
            const XTrainFile = "./dataSets/trainingData/trainingDataValue.csv";
            const alphaFile = "./dataSets/alphaData/alphaValues.csv";
            
            // Await the loading of model data and the prediction
            await this.svrModel.loadModelData(XTrainFile, alphaFile);
            const predictedPrice = this.svrModel.predictPrice(input);
            console.log(`Predicted Price: ${predictedPrice}`);
            return predictedPrice; // Return the predicted price directly
        }
    
        // Handle the case where input is neither a valid CSV nor an object
        throw new Error("Invalid input: Expected CSV file path or single-row data object.");
    }
    
}

export default ModelManager;
