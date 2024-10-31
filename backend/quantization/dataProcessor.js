import axios from 'axios';

class DataProcessor {
    async getGeocode(location) {
        const locationParts = location.split(',').map(part => part.trim());
        const locationString = locationParts.slice(0, 2).join(', ');
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationString)}`;

        try {
            const response = await axios.get(url, { timeout: 10000 });
            if (response.data.length > 0) {
                const { lat, lon } = response.data[0];
                return { lat, lon };
            } else {
                return { lat: null, lon: null };
            }
        } catch (error) {
            return { lat: null, lon: null };
        }
    }

    convertRoadSize(roadSize) {
        const roadSizeStr = String(roadSize).toLowerCase().trim();

        if (roadSizeStr.includes('feet')) {
            // Remove 'feet' and trim the string, then parse the float
            return parseFloat(roadSizeStr.replace('feet', '').trim());
        }

        return parseFloat(roadSizeStr);
    }
    

    convertLandArea(landArea) {
        if (!landArea) {
            throw new Error("Invalid land area provided");
        }
    
        // Convert to string and trim spaces
        landArea = String(landArea).trim();
    
        // Initialize total area in square feet
        let totalArea = 0;
    
        // Convert plain number input to Anna and Dam
        if (!isNaN(landArea)) {
            const plainValue = parseFloat(landArea);
            const annaValue = Math.floor(plainValue);
            const damValue = Math.round((plainValue - annaValue) * 10); // Assuming 1 decimal = 10 Dam
            totalArea += (annaValue * 342.25) + (damValue * 21.39);
            return totalArea;
        }
    
        // Handling "X Anna and Y Dam"
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
    
        // Handling format "Ropani.Aana.Paisa.Daam" (like 1.3.2.1)
        if (landArea.match(/\d+[\.\-]\d+[\.\-]\d+[\.\-]\d+/)) {
            const [ropani, aana, paisa, daam] = landArea.split(/[\.\-]/).map(Number);
            return (ropani * 5476) + (aana * 342.25) + (paisa * 85.56) + (daam * 21.39);
        }
    
        // Handling format "Aana.Paisa.Daam" (like 3.2.1 or 3.2)
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
    
        // Handling Dam-only input
        if (landArea.toLowerCase().includes('dam')) {
            return totalArea + parseFloat(landArea.replace(/Dam/gi, '').trim()) * 21.39;
        }
    
        // Return the total area as plain number if no special unit is detected
        return totalArea || parseFloat(landArea);
    }
    
    

    // convertPrice(price) {
    //     price = price.replace(/Rs\.?/gi, '').replace(/,/g, '').trim();
    //     if (/cr/i.test(price)) {
    //         return parseFloat(price.replace(/cr/i, '').trim()) * 10000000;
    //     }
    //     if (/lakhs/i.test(price)) {
    //         return parseFloat(price.replace(/lakhs/i, '').trim()) * 100000;
    //     }
    //     return parseFloat(price);
    // }

    convertBuiltOn(builtOn) {
        // Ensure builtOn is a string
        if (typeof builtOn !== 'string') {
            builtOn = String(builtOn); // Convert to string if it's not
        }
    
        // Trim spaces and convert to uppercase for case-insensitive comparison
        const cleanedInput = builtOn.trim().toUpperCase();
    
        // Remove the B.S. or BS part if it exists
        const yearString = cleanedInput.replace(/B\.S\.?/g, '').replace(/BS/g, '').trim();
    
        // Parse the year as an integer
        const nepaliYear = parseInt(yearString, 10);
    
        // Check if the parsed year is valid
        if (isNaN(nepaliYear)) {
            throw new Error("Invalid year format provided");
        }
    
        // Return the converted year (Nepali to Gregorian)
        return nepaliYear - 57;
    }
    
    
}

export default DataProcessor;
