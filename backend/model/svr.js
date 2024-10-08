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

                if (Math.abs(error) > this.epsilon) {
                    this.alpha[i] += this.C * error;
                }
            }
        }

        this.b = y_train.reduce((sum, val, i) => sum + (val - this.predict(X_train[i])), 0) / n;
    }

    // Predict using the trained model
    predict(x) {
        let result = this.b;
        for (let i = 0; i < this.alpha.length; i++) {
            result += this.alpha[i] * this.rbfKernel(x, this.X_train[i]);
        }
        return result;
    }

    // Function to calculate Mean Squared Error
    calculateMSE(X_test, y_test) {
        const n = X_test.length;
        let totalError = 0;
    
        for (let i = 0; i < n; i++) {
            // Check for NaN or undefined values in X_test and y_test
            if (!X_test[i] || !y_test[i] || isNaN(y_test[i])) {
                console.error(`Invalid data at index ${i}: X_test[i] = ${X_test[i]}, y_test[i] = ${y_test[i]}`);
                continue;
            }
    
            const prediction = this.predict(X_test[i]);
            if (isNaN(prediction)) {
                console.error(`Prediction returned NaN for X_test[i]: ${X_test[i]}`);
                continue;
            }
    
            totalError += (y_test[i] - prediction) ** 2;
        }
    
        return totalError / n;
    }
    
}
