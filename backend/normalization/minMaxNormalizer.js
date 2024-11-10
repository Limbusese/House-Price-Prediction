class MinMaxCalculator {
    constructor() {
        // this.minMaxValues = { 
        // locationLat: { min: 27.5920585, max: 51.4568388 },
        // locationLon: { min: -79.8675813, max: 85.4803234 },
        // builtOn: { min: 1990, max: 2022 },
        // bedrooms: { min: 1, max: 14 },
        // bathrooms: { min: 1, max: 10 },
        // landArea: { min: 752.95, max: 7187.25 },
        // roadSize: { min: 0, max: 30 }};


        this.minMaxValues = { 
            locationLat: {min: 13.5842501, max: 51.4568388},
            locationLon: {min: -79.8675813, max: 88.0103548},
            // price: {Min: 5000000, Max: 1025000000}  
            builtOn: {min: 1947, max: 2024},  
            bedrooms: {min: -6, max: 36},
            bathrooms: {min: 1, max: 34},
            landArea: {min: 0, max: 22502.93},
            roadSize: {min: 4, max: 82},   
        }
    }

    safeParseFloat(value) {
        return value ? parseFloat(value) : 0;
    }

    // Calculate min and max for all features in the dataset
    calculateMinMax(data, features) {
        features.forEach(feature => {
            this.minMaxValues[feature] = { min: Infinity, max: -Infinity };
        });

        data.forEach(row => {
            features.forEach(feature => {
                const value = this.safeParseFloat(row[feature]);
                if (value < this.minMaxValues[feature].min) this.minMaxValues[feature].min = value;
                if (value > this.minMaxValues[feature].max) this.minMaxValues[feature].max = value;
            });
        });
    }

    normalize(value, min, max) {
        return (value - min) / (max - min);
    }

    // Normalize a row of data
    normalizeRow(row, features) {
        const normalizedRow = {};
        features.forEach(feature => {
            const value = this.safeParseFloat(row[feature]);
            normalizedRow[feature] = this.normalize(value, this.minMaxValues[feature].min, this.minMaxValues[feature].max);
        });
        return normalizedRow;
    }
}

export default MinMaxCalculator;