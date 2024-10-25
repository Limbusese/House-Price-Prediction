import MinMaxCalculator from './minMaxNormalizer.js';

class SingleRowNormalizer {
    constructor() {
        this.minMaxCalculator = new MinMaxCalculator();
    }

    normalizeSingleRow(row, features) {
        console.log(`rows datas are: ${row}`);
        if (Object.keys(this.minMaxCalculator.minMaxValues).length === 0) {
            throw new Error('Min/Max values not calculated yet. Load CSV first or provide min/max.');
        }

        return this.minMaxCalculator.normalizeRow(row, features);
    }

    // // Optionally, calculate min/max using existing CSV dataset
    // async loadMinMaxFromCSV(csvNormalizerInstance, inputFilePath, features) {
    //     await csvNormalizerInstance.loadAndCalculateMinMaxFromCSV(inputFilePath, features);
    //     this.minMaxCalculator.minMaxValues = csvNormalizerInstance.minMaxCalculator.minMaxValues;
    // }
}

export default SingleRowNormalizer;
