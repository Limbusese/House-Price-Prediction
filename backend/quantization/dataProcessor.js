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
            return parseFloat(roadSizeStr.replace('feet', '').trim());
        } 
        return parseFloat(roadSizeStr);
    }
    

    convertLandArea(landArea) {
        // Ensure landArea is not undefined or null, and convert it to a string
        if (!landArea) {
            throw new Error("Invalid land area provided");
        }
    
        // Convert to string and trim spaces
        landArea = String(landArea).trim();
    
        // Handling case with Anna and Dam
        if (landArea.toLowerCase().includes('anna')) {
            if (landArea.toLowerCase().includes('dam')) {
                // Split between "Anna" and "Dam"
                const [annaPart, damPart] = landArea.split(/Anna/i); // Case-insensitive split
                const annaValue = parseFloat(annaPart.trim()) || 0;  // Default to 0 if annaPart is not a number
                const damValue = parseFloat(damPart.replace(/Dam/gi, '').trim()) || 0;
                return (annaValue * 342.25) + (damValue * 21.39);
            } else {
                return parseFloat(landArea.replace(/Anna/gi, '').trim()) * 342.25;
            }
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
            return (aana * 342.25) + (paisa * 85.56) + (daam * 21.39);
        }
    
        // Handling Dam-only input
        if (landArea.toLowerCase().includes('dam')) {
            return parseFloat(landArea.replace(/Dam/gi, '').trim()) * 21.39;
        }
    
        // Return as plain number if no special unit is detected
        return parseFloat(landArea);
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
        const nepaliYear = parseInt(builtOn.replace('B.S.', '').trim());
        return nepaliYear - 57;
    }
}

export default DataProcessor;
