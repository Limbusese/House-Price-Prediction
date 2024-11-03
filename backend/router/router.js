import express from 'express';
import {getServer, predictPrice} from '../controller/controller.js';
import {predictBuyerPrice} from '../controller/predictBuyerHouse.js';
import { countCSVRows } from '../controller/dataRowCounter.js';


class Router {
    constructor() {
        this.router = express.Router(); 
        this.setupRoutes(); 
    }

    setupRoutes() {
        
        this.router.get('/', getServer);

        this.router.post("/predictHousePrice", predictPrice);

        this.router.post("/predictBuyerHousePrice", predictBuyerPrice);

        this.router.get("/getCsvRows", countCSVRows);
        
    }
}

const myRouter = new Router(); 
export default myRouter.router; 
