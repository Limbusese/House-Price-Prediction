import SingleRowProcessor from "../quantization/singleRowProcessor.js";
import SingleRowNormalizer from "../normalization/singleRowNormalizer.js";
import ModelManager from "../model/modelDataManager.js";
import PricePrediction from "../denormalization/pricedenormalization.js";

// Endpoint to test if the server is working
export const getServer = async (req, res) => {
    try {
        res.json("Hi! This is the server");
    } catch (err) {
        res.status(400).json("Error while running server");
    }
};

// Function to predict house price
export const predictPrice = async (req, res) => {
    try {
        const { location, roadSize, bedrooms, bathrooms, landArea, builtOn } = req.body;
        console.log("The data from request body:", req.body);

        // Check for missing required fields
        const missingFields = [];
        if (!location) missingFields.push('location');
        if (!roadSize) missingFields.push('roadSize');
        if (!bedrooms) missingFields.push('bedrooms');
        if (!bathrooms) missingFields.push('bathrooms');
        if (!landArea) missingFields.push('landArea');
        if (!builtOn) missingFields.push('builtOn');

        // If any field is missing, return error
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required data fields: ${missingFields.join(', ')}` });
        }

        const inputData = { location, roadSize, bedrooms, bathrooms, landArea, builtOn };
        console.log("Input Data:", inputData);

        // Process the input data (quantification)
        const quantifiedDataManager = new SingleRowProcessor(inputData);
        const quantifiedData = await quantifiedDataManager.processRow();
        console.log("Quantified Data:", quantifiedData);

        // Normalization process
        const singleRowNormalization = new SingleRowNormalizer();
        const features = ['locationLat', 'locationLon', 'builtOn', 'bedrooms', 'bathrooms', 'landArea', 'roadSize'];
        const singleNormalizedData =  singleRowNormalization.normalizeSingleRow(quantifiedData, features);
        console.log("Normalized Data:", singleNormalizedData);

        // Predict price using the trained model
        const modelManager = new ModelManager();
        const modelPredictedPrice = await modelManager.handleInput(singleNormalizedData); // Await the promise
        console.log("Model Predicted Price:", modelPredictedPrice);

        // Initialize PricePrediction with min and max price
        const minPrice = 5000000; // Set your actual min price
        const maxPrice = 1025000000 ; // Set your actual max price
        const priceDenormalization = new PricePrediction(minPrice, maxPrice);

        // Denormalize the predicted price
        const finalPrice = priceDenormalization.predictActualPrice(modelPredictedPrice);

        // Send the predicted price as a response
        return res.status(200).json({ price: finalPrice });

    } catch (error) {
        console.error('Error predicting house price:', error);
        return res.status(500).json({ error: 'Failed to predict house price.' });
    }
};




// export const predictBuyerPrice = async (req, res) => {
//     try {
//         const { location, roadSize, bedrooms, bathrooms, landArea, builtOn } = req.body;
//         console.log("The data from request body:", req.body);

//         // Check if req.body exists and has the necessary properties
//         if ( !location || !roadSize || !bedrooms || !bathrooms || !landArea || !builtOn) {
//             return res.status(400).json({ error: 'Missing required fields in request body' });
//         }

//         // Prepare user input data for prediction
//         const userInputData = { location, roadSize, bedrooms, bathrooms, landArea, builtOn };

//         // Call predictPrice and get the returned price
//         const price = await predictPrice(userInputData);
//         console.log("The price is:", price);

//         // Send the response with the predicted price
//         return res.status(200).json({ price });

//     } catch (error) {
//         console.error('Error predicting buyer price:', error);
//         return res.status(500).json({ error: 'Failed to predict buyer price.' });
//     }
// };




