import DataProcessor from './dataProcessor.js';

class SingleRowProcessor extends DataProcessor {
    constructor(row) {
        super();
        this.row = row;
    }

    async processRow() {
        const geocode = await this.getGeocode(this.row.location);
        if (geocode.lat && geocode.lon) {
            const convertedRow = {
                locationLat: geocode.lat,
                locationLon: geocode.lon,
                roadSize: this.convertRoadSize(this.row.roadSize),
                bedrooms: parseInt(this.row.bedrooms) || 0,
                bathrooms: parseInt(this.row.bathrooms) || 0,
                landArea: this.convertLandArea(this.row.landArea),
                // price: this.convertPrice(this.row.price),
                builtOn: this.convertBuiltOn(this.row.builtOn),
            };
            console.log(`Processed single row: ${JSON.stringify(convertedRow)}`);
            return convertedRow;
        } else {
            console.error("Geocode failed for the row.");
            return null;
        }
    }
}

export default SingleRowProcessor;
