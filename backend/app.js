import express from 'express';
import router from './router/router.js';
import cors from 'cors'  

class App {
    constructor() {
        this.app = express(); 
        this.port = process.env.PORT || 8020; 
        this.setMiddlewares(); 
        this.setRoutes(); 
    }

    setMiddlewares() {
        this.app.use(cors());
        this.app.use(express.json()); // Middleware to parse JSON
    }

    setRoutes() {
        
        this.app.use('/api', router);
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server running on port ${this.port}`);
        });
    }
}

const myApp = new App();
myApp.start(); 
