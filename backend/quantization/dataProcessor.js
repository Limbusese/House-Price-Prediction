import axios from 'axios';

class DataProcessor {
    constructor() {
        this.lastRequestTime = 0; // Time of the last request (in milliseconds)
        this.requestDelay = 1000; // Minimum delay between requests in milliseconds (1 second)
    }

    // Helper function to enforce rate-limiting
    async rateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        // If the time since the last request is less than the delay, wait
        if (timeSinceLastRequest < this.requestDelay) {
            const waitTime = this.requestDelay - timeSinceLastRequest;
            console.log(`Rate limiting: Waiting for ${waitTime}ms`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now(); // Update the time of the last request
    }

    async getGeocode(location) {
        await this.rateLimit(); // Ensure rate limiting is applied before making the request
    
        const locationParts = location.split(',').map(part => part.trim());
        const locationString = locationParts.slice(0, 2).join(', ');
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}`;
    
        try {
            const response = await axios.get(url, {
                timeout: 50000,
                headers: { 'User-Agent': 'gharNepal/1.0 (seselimbu98@gmail.com)' }
            });
            
            if (response.data.length > 0) {
                const { lat, lon } = response.data[0];
                return { lat, lon };
            } else {
                console.log(`No results found for "${locationString}".`);
                return { lat: null, lon: null };
            }
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                console.log("Request timed out.");
            } else if (error.response && error.response.status === 429) {
                console.log("Rate limit exceeded. Please try again later.");
            } else {
                console.log("Failed Message:", error.message);
                console.error("Full error:", error);
            }
            return { lat: null, lon: null };
        }
    }
    
    convertRoadSize(roadSize) {
        const roadSizeStr = String(roadSize).toLowerCase().trim();

        if (roadSizeStr.includes('feet')) {
            return parseFloat(roadSizeStr.replace('feet', '').trim());
        }

        return parseFloat(roadSizeStr);
    }

    convertLandArea(landArea) {
        if (!landArea) {
            throw new Error("Invalid land area provided");
        }

        landArea = String(landArea).trim();
        let totalArea = 0;

        if (!isNaN(landArea)) {
            const plainValue = parseFloat(landArea);
            const annaValue = Math.floor(plainValue);
            const damValue = Math.round((plainValue - annaValue) * 10);
            totalArea += (annaValue * 342.25) + (damValue * 21.39);
            return totalArea;
        }

        const annaAndDamMatch = landArea.match(/(\d+(\.\d+)?)\s*Anna/i);
        const damMatch = landArea.match(/(\d+(\.\d+)?)\s*Dam/i);

        if (annaAndDamMatch) {
            const annaValue = parseFloat(annaAndDamMatch[1]);
            totalArea += annaValue * 342.25;
        }
        if (damMatch) {
            const damValue = parseFloat(damMatch[1]);
            totalArea += damValue * 21.39;
        }

        if (landArea.match(/\d+[\.\-]\d+[\.\-]\d+[\.\-]\d+/)) {
            const [ropani, aana, paisa, daam] = landArea.split(/[\.\-]/).map(Number);
            return (ropani * 5476) + (aana * 342.25) + (paisa * 85.56) + (daam * 21.39);
        }

        if (landArea.match(/\d+[\.\-]\d+[\.\-]?\d*/)) {
            const parts = landArea.split(/[\.\-]/).map(Number);
            let aana = 0, paisa = 0, daam = 0;
            if (parts.length === 3) {
                [aana, paisa, daam] = parts;
            } else if (parts.length === 2) {
                [aana, paisa] = parts;
            } else if (parts.length === 1) {
                aana = parts[0];
            }
            totalArea += (aana * 342.25) + (paisa * 85.56) + (daam * 21.39);
        }

        if (landArea.toLowerCase().includes('dam')) {
            return totalArea + parseFloat(landArea.replace(/Dam/gi, '').trim()) * 21.39;
        }

        return totalArea || parseFloat(landArea);
    }

    convertBuiltOn(builtOn) {
        if (typeof builtOn !== 'string') {
            builtOn = String(builtOn);
        }

        const cleanedInput = builtOn.trim().toUpperCase();
        const yearString = cleanedInput.replace(/B\.S\.?/g, '').replace(/BS/g, '').trim();
        const nepaliYear = parseInt(yearString, 10);

        if (isNaN(nepaliYear)) {
            throw new Error("Invalid year format provided");
        }

        return nepaliYear - 57;
    }
}

export default DataProcessor;
