import SingleRowProcessor from "../quantization/singleRowProcessor.js";
import SingleRowNormalizer from "../normalization/singleRowNormalizer.js";
import ModelManager from "../model/modelDataManager.js";
import PricePrediction from "../denormalization/pricedenormalization.js";
import NearbyFacilitiesFinder from "../nearbyFacilities/nearbyFacilities.js";

// Function to predict buyer house price
export const predictBuyerPrice = async (req, res) => {
    try {
        const { location, roadSize, bedrooms, bathrooms, landArea, builtOn } = req.body;
        console.log("The data from request body:", req.body);

        const missingFields = [];
        if (!location) missingFields.push('location');
        if (!roadSize) missingFields.push('roadSize');
        if (!bedrooms) missingFields.push('bedrooms');
        if (!bathrooms) missingFields.push('bathrooms');
        if (!landArea) missingFields.push('landArea');
        if (!builtOn) missingFields.push('builtOn');

        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Missing required data fields: ${missingFields.join(', ')}` });
        }

        const inputData = { location, roadSize, bedrooms, bathrooms, landArea, builtOn };
        console.log("Input Data:", inputData);

        const quantifiedDataManager = new SingleRowProcessor(inputData);
        const quantifiedData = await quantifiedDataManager.processRow();
        console.log("Quantified Data:", quantifiedData);

        const singleRowNormalization = new SingleRowNormalizer();
        const features = ['locationLat', 'locationLon', 'builtOn', 'bedrooms', 'bathrooms', 'landArea', 'roadSize'];
        const singleNormalizedData = singleRowNormalization.normalizeSingleRow(quantifiedData, features);
        console.log("Normalized Data:", singleNormalizedData);

        const modelManager = new ModelManager();
        const modelPredictedPrice = await modelManager.handleInput(singleNormalizedData);
        console.log("Model Predicted Price:", modelPredictedPrice);

        const minPrice = 5000000;
        const maxPrice = 1025000000;
        const priceDenormalization = new PricePrediction(minPrice, maxPrice);
        const finalPrice = priceDenormalization.predictActualPrice(modelPredictedPrice);

        const nearbyFacilitiesFinder = new NearbyFacilitiesFinder(location);
        const nearbyFacilitiesData = await nearbyFacilitiesFinder.getNearbyFacilities();

        return res.status(200).json({
            price: finalPrice,
            facilities: nearbyFacilitiesData
        });

    } catch (error) {
        console.error('Error predicting house price:', error);
        return res.status(500).json({ error: 'Failed to predict house price.' });
    }
};
