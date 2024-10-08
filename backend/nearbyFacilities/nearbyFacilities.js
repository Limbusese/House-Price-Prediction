import axios from 'axios';

class NearbyFacilitiesFinder {
    constructor(location) {
        this.location = location;
        this.latitude = null;
        this.longitude = null;
        this.desiredAmenities = ['school', 'hospital', 'restaurant', 'marketplace'];
        this.facilityLimits = { school: 3, hospital: 2, restaurant: 2, marketplace: 2 };
        this.facilityCount = { school: 0, hospital: 0, restaurant: 0, marketplace: 0 };
        this.geocodeCache = {}; // Cache for geocode results
    }

    transliterateNepaliToEnglish(name) {
        const transliterationMap = { 'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ii', 'उ': 'u', 'ऊ': 'uu', /* More mappings... */ };
        return name.split('').map(char => transliterationMap[char] || char).join('');
    }

    async getGeocode() {
        // Check cache first
        if (this.geocodeCache[this.location]) {
            const { lat, lon } = this.geocodeCache[this.location];
            this.latitude = lat;
            this.longitude = lon;
            return;
        }

        try {
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(this.location)}&format=json&limit=1`;
            console.log('Geocode request URL:', geocodeUrl);
            const response = await axios.get(geocodeUrl);
            
            if (response.data.length === 0) {
                console.log(`Location "${this.location}" not found.`);
                return null;
            }
            this.latitude = response.data[0].lat;
            this.longitude = response.data[0].lon;

            // Store in cache
            this.geocodeCache[this.location] = { lat: this.latitude, lon: this.longitude };
        } catch (error) {
            console.error('Error fetching geocode:', error.message || error);
            throw error;
        }
    }

    async getNearbyFacilities(radius = 2000) {
        try {
            if (!this.latitude || !this.longitude) await this.getGeocode();
            const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node[amenity](around:${radius},${this.latitude},${this.longitude});out;`;
            const response = await axios.get(overpassUrl);

            const facilities = response.data.elements;
            const nearbyFacilities = facilities.reduce((result, facility) => {
                const type = facility.tags.amenity;

                // Check if the facility type is in the desired amenities and within the limit
                if (this.desiredAmenities.includes(type) && this.facilityCount[type] < this.facilityLimits[type]) {
                    let name = facility.tags['name:en'] || this.transliterateNepaliToEnglish(facility.tags.name || 'Unknown');
                    const distance = this.getDistance(this.latitude, this.longitude, facility.lat, facility.lon);

                    // Only include facilities if the distance is within the radius
                    if (distance <= radius) {
                        result.push({ name, type, lat: facility.lat, lon: facility.lon, distance });
                        this.facilityCount[type]++;
                    }
                }
                return result;
            }, []);

            // Sort facilities by distance
            nearbyFacilities.sort((a, b) => a.distance - b.distance);

            return nearbyFacilities.length > 0 ? nearbyFacilities : [{ name: 'No nearby facilities available', type: 'info' }];
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.error('Rate limit exceeded. Please wait before trying again.');
                // Optional: Implement exponential backoff here if needed
            } else {
                console.error('Error fetching nearby facilities:', error.message || error);
            }
            return [];
        }
    }

    getDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth's radius in meters
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in meters
    }
}

export default NearbyFacilitiesFinder;
