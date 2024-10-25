class PricePrediction {
    constructor(minPrice, maxPrice) {
        if (minPrice >= maxPrice) {
            throw new Error("minPrice must be less than maxPrice");
        }
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }

    // Denormalize the price
    denormalizePrice(normalizedPrice) {
        if (normalizedPrice < 0 || normalizedPrice > 1) {
            throw new Error("Normalized price must be between 0 and 1");
        }
        return normalizedPrice * (this.maxPrice - this.minPrice) + this.minPrice;
    }

    // Normalize a price
    normalizePrice(originalPrice) {
        console.log("or", originalPrice)
        if (originalPrice < this.minPrice || originalPrice > this.maxPrice) {
            throw new Error("Original price must be between minPrice and maxPrice");
        }
        return (originalPrice - this.minPrice) / (this.maxPrice - this.minPrice);
    }

    // Predict the actual price from a normalized price
    predictActualPrice(normalizedPrice) {
        console.log("Normalized Predicted Pricerty:", normalizedPrice);
        const predictedOriginalPrice = this.denormalizePrice(normalizedPrice);
        console.log("Original Predicted Price:", predictedOriginalPrice);
        return predictedOriginalPrice;
    }
}

// Export the class
export default PricePrediction;
