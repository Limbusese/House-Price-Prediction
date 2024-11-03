import fs from "fs";
import csv from "csv-parser";
import SupportVectorRegression from "../model/svr.js";

class SVRModel {
  constructor(trainDataFile, testDataFile, alphaFilePath, xTrainFilePath) {
    this.trainDataFile = trainDataFile;
    this.testDataFile = testDataFile;
    this.alphaFilePath = alphaFilePath; // File path for saving alpha values
    this.xTrainFilePath = xTrainFilePath; // File path for saving X_train data
    this.X_train = [];
    this.y_train = [];
    this.X_test = [];
    this.y_test = [];
    this.svrModel = null;
    this.alpha = null; // To store alpha values after training
  }

  // Method to load data from CSV
  loadCsvData(filePath) {
    return new Promise((resolve, reject) => {
      const data = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row) => {
          // Convert strings to numbers
          data.push(Object.values(row).map(Number));
        })
        .on("end", () => resolve(data))
        .on("error", (err) => reject(err));
    });
  }

  // Method to prepare data for training/testing
  async prepareData() {
    try {
      // Load training and testing datasets
      const trainData = await this.loadCsvData(this.trainDataFile);
      const testData = await this.loadCsvData(this.testDataFile);

      this.X_train = trainData.map((row) =>
        row.filter((_, index) => index !== 2)
      );
      this.y_train = trainData.map((row) => row[2]); 

      this.X_test = testData.map((row) =>
        row.filter((_, index) => index !== 2)
      ); 
      this.y_test = testData.map((row) => row[2]); 

      console.log("Data preparation complete!");
    } catch (error) {
      console.error("Error loading data:", error);
    }
  }

  // Method to train the SVR model
  trainModel(C, epsilon, gamma) {
    this.svrModel = new SupportVectorRegression(C, epsilon, gamma);
    this.svrModel.fit(this.X_train, this.y_train);
    this.alpha = this.svrModel.alpha; // Store alpha values after training
    console.log("Model trained successfully!");
    
    // Save alpha values and X_train to specified files
    this.saveAlphaAndTrainingData();
  }

  // Save alpha values and X_train to files
  saveAlphaAndTrainingData() {
    try {
      // Save alpha values to a specified file location
      fs.writeFileSync(this.alphaFilePath, this.alpha.join("\n"));
      console.log(`Alpha values saved to ${this.alphaFilePath}`);

      // Save X_train to a specified file location
      const xTrainData = this.X_train.map((row) => row.join(",")).join("\n");
      fs.writeFileSync(this.xTrainFilePath, xTrainData);
      console.log(`X_train data saved to ${this.xTrainFilePath}`);
    } catch (error) {
      console.error("Error saving alpha and X_train data:", error);
    }
  }

  // Method to test the model and calculate Mean Squared Error
  testModel() {
    const mape = this.svrModel.calculateMAPE(this.X_test, this.y_test);
    console.log(`Mean Absolute Percentage Error (MAPE) on test data: ${mape.toFixed(2)}%`);
  }

  // Method to predict house price based on features
  predictPrice(features) {
    if (this.svrModel) {
      const prediction = this.svrModel.predict(features);
      console.log(`Predicted Price: ${prediction}`);
      return prediction; // Return the predicted price
    } else {
      console.error("Model has not been trained yet.");
      return null; // Return null if the model is not trained
    }
  }

  // Run the entire training and testing process
  async run(C, epsilon, gamma) {
    await this.prepareData(); // Prepare the data
    this.trainModel(C, epsilon, gamma); // Train the model
    this.testModel(); // Test the model and calculate error
  }
}

// Function to denormalize the predicted price
function denormalizePrice(normalizedPrice, min, max) {
  return normalizedPrice * (max - min) + min;
}

// Create an instance of the class and run the model
const svrModel = new SVRModel(
  "../dataSets/trainDataSet/houseDatasetstrain_data_normalized.csv", // Training data
  "../dataSets/testDataSet/houseDatasetstest_data_normalized.csv",  // Test data
  "../dataSets/alphaData/alphaValues.csv",  // Custom file location for alpha
  "../dataSets/trainingData/trainingDataValue.csv"  // Custom file location for X_train
);

(async () => {
  await svrModel.run(1, 0.1, 0.5); // Pass C, epsilon, gamma as arguments

  // Example usage for predicting a house price
  const sampleFeatures = [
     0.37415928475995625,
     0.9841477362996515,
     0.961038961038961,
     0.21428571428571427,
     0.06060606060606061,
     0.06178706506219413,
     0.11538461538461539
  ]; // Example normalized feature values

  const predictedNormalizedPrice = svrModel.predictPrice(sampleFeatures);
  
  // Normalization parameters for price
  const minPrice = 2.5; 
  const maxPrice = 325000000;

  const predictedOriginalPrice = denormalizePrice(predictedNormalizedPrice, minPrice, maxPrice);
  
  console.log("Normalized Predicted Price:", predictedNormalizedPrice);
  console.log("Original Predicted Price:", predictedOriginalPrice);
})();
