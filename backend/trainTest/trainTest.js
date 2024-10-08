import fs from "fs";
import csv from "csv-parser";
import SupportVectorRegression from "../model/svr.js";

class SVRModel {
  constructor(trainDataFile, testDataFile) {
    this.trainDataFile = trainDataFile;
    this.testDataFile = testDataFile;
    this.X_train = [];
    this.y_train = [];
    this.X_test = [];
    this.y_test = [];
    this.svrModel = null;
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
    console.log("Model trained successfully!");
  }

  // Method to test the model and calculate Mean Squared Error
  testModel() {
    const mse = this.svrModel.calculateMSE(this.X_test, this.y_test);
    console.log(`Mean Squared Error on test data: ${mse}`);
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

// Create an instance of the class and run the model
const svrModel = new SVRModel(
  "../dataSets/houseDatasetstrain_data.csv",
  "../dataSets/houseDatasetstest_data.csv"
);
svrModel.run(1, 0.1, 0.5); // Pass C, epsilon, gamma as arguments

// Example usage for predicting a house price
const sampleFeatures = [0.5, 0.3, 0.75, 0.2, 0.8, 0.6, 0.9]; // Example normalized feature values
const predictedPrice = svrModel.predictPrice(sampleFeatures);
