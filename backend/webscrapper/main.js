import CardScraper from "./scrap.js";
import NearbyFacilitiesFinder from "../nearbyFacilities/nearbyFacilities.js";
import { Parser } from 'json2csv';  // Import json2csv for CSV conversion
import fs from 'fs';  // Import the file system module

class ScraperWithFacilities {
    constructor(url) {
        this.scraper = new CardScraper(url);  // Initialize the CardScraper instance
        this.scrapeWithFacilities = [];  // Array to store cards with appended facilities
    }

    // Method to scrape cards and append nearby facilities
    async scrapeAndAppendFacilities() {
        try {
            const cards = await this.scraper.scrape(); // Fetch the scraped cards
            console.log("this is card details:", cards);

            // Convert cards data to CSV and save to file
            await this.saveCardsToCSV(cards);
    
            return cards;  // Return the final cards
        } catch (error) {
            console.error("Error scraping cards:", error);
            throw error;
        }
    }

    // Function to save cards as CSV file
    async saveCardsToCSV(cards) {
        try {
            // Specify the fields/columns for the CSV
            const fields = Object.keys(cards[0]);  // Get headers from first card object
            const json2csvParser = new Parser({ fields });
            const csv = json2csvParser.parse(cards);  // Convert the cards array to CSV format

            const folderPath = './dataSets';  // Define the folder to save the CSV
            const filePath = `${folderPath}/gharSansar.csv`;  // Define the full file path

            // Check if the folder exists, create it if not
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath);  // Create the folder
            }

            // Write the CSV data to the file
            fs.writeFileSync(filePath, csv, 'utf8');
            console.log(`CSV file has been saved at: ${filePath}`);
        } catch (error) {
            console.error("Error saving cards to CSV:", error);
            throw error;
        }
    }
}

// Example usage:
async function main() {
    const scraperWithFacilities = new ScraperWithFacilities('https://gharsansarnepal.com/property/house-in-kathmandu/category?page=40');
    
    try {
        const updatedCards = await scraperWithFacilities.scrapeAndAppendFacilities();  // Scrape and append facilities
        console.log("All cards with nearby facilities saved to CSV.");
    } catch (error) {
        console.error("Error during scraping and updating:", error);
    }
}

main();  // Call the async function

export default ScraperWithFacilities;
