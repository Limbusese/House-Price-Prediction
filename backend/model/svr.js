export default class SupportVectorRegression {
    constructor(C, epsilon, gamma) {
        this.C = C;
        this.epsilon = epsilon;
        this.gamma = gamma;
        this.alpha = [];
        this.b = 0;
        this.X_train = [];
    }

    // RBF kernel function
    rbfKernel(x1, x2) {
        const distance = x1.reduce((sum, val, i) => sum + (val - x2[i]) ** 2, 0);
        return Math.exp(-this.gamma * distance);
    }

    // Fit the model with training data
    fit(X_train, y_train) {
        this.X_train = X_train;
        const n = X_train.length;
        this.alpha = new Array(n).fill(0);

        // Simplified optimization process
        for (let iteration = 0; iteration < 1000; iteration++) {
            for (let i = 0; i < n; i++) {
                let prediction = this.predict(X_train[i]);
                const error = y_train[i] - prediction;

                // Update alpha only if error exceeds epsilon
                if (Math.abs(error) > this.epsilon) {
                    this.alpha[i] = Math.min(this.C, Math.max(-this.C, this.alpha[i] + this.C * error));
                }
            }
        }

        // Update bias term using the support vectors (those where alpha is not zero)
        let bSum = 0;
        let supportVectorCount = 0;
        for (let i = 0; i < n; i++) {
            if (Math.abs(this.alpha[i]) > 1e-6) {
                bSum += y_train[i] - this.predict(X_train[i]);
                supportVectorCount++;
            }
        }
        this.b = bSum / supportVectorCount;

        // Console logs after training
        console.log("Alpha values after training:", this.alpha);
        console.log("Training data (X_train) after training:", this.X_train);
    }

    // Predict using the trained model
    predict(x) {
        let result = this.b;
        for (let i = 0; i < this.alpha.length; i++) {
            if (Math.abs(this.alpha[i]) > 1e-6) {  // Only use support vectors
                result += this.alpha[i] * this.rbfKernel(x, this.X_train[i]);
            }
        }
        return result;
    }

   // Function to calculate Mean Absolute Percentage Error
 
calculateMAPE(X_test, y_test) {
    console.log("ytestdata", y_test)
    const n = X_test.length;
    let totalError = 0;
    let validCount = 0; // Count of valid observations

    for (let i = 0; i < n; i++) {
        if (!X_test[i] || !y_test[i] || isNaN(y_test[i])) {
            console.error(`Invalid data at index ${i}: X_test[i] = ${X_test[i]}, y_test[i] = ${y_test[i]}`);
            continue;
        }

        const prediction = this.predict(X_test[i]);
        if (isNaN(prediction)) {
            console.error(`Prediction returned NaN for X_test[${i}]: ${X_test[i]}`);
            continue;
        }

        // Avoid division by zero and calculate absolute percentage error only for valid values
        if (y_test[i] !== 0) {
            totalError += Math.abs((y_test[i] - prediction) / y_test[i]);
            validCount++;
        } else {
            console.warn(`Actual value is zero at index ${i}. Skipping this entry.`);
        }
    }

    return validCount > 0 ? (totalError / validCount) * 100 : 0; // Return MAPE as a percentage
}

}



    
