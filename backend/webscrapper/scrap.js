import axios from 'axios';
import * as cheerio from 'cheerio';

class CardScraper {
    constructor(baseUrl, maxPages = 40) {
        this.baseUrl = baseUrl;
        this.maxPages = maxPages;
    }

    async fetchHTML(url) {
        try {
            const { data } = await axios.get(url);
            return data;
        } catch (error) {
            console.error(`Error fetching the HTML from ${url}: ${error.message}`);
            return null;
        }
    }

    extractCardUrls(html) {
        const $ = cheerio.load(html);
        const cardUrls = [];
        

        $('.row .explore-item').each((index, element) => {
            // Extract the onclick attribute
            const onclickAttr = $(element).attr('onclick');
            
            // Use a regular expression to extract the URL path from the onclick attribute
            const match = onclickAttr && onclickAttr.match(/location\.href\s*=\s*(?:'|")?([^'"]+)(?:'|")?/);
            
            if (match && match[1]) {
                cardUrls.push(match[1]);
            }
        });
    
   
        return cardUrls; 
    }
    


    extractCardDetails(html) {
        const $ = cheerio.load(html);
        
        // Initialize variables
        let roadSize = null;
        let beds = null;
        let bathrooms = null;
        let builtOn = null;
        let landArea = null;
        let price = null;
        let location = null;
     
    
        // Target the specific class that contains the house properties
        $('.contact-list ul li').each((index, element) => {
            const text = $(element).text().trim();
            
            if (text.includes('Road Size')) {
                // Match road size, capturing digits (e.g., "Road Size: 12m", "Road Size: 10 ft")
                roadSize = text.match(/Road Size\s*:\s*([\d.]+)\s*(m|ft)?/i)?.[1]?.trim();
                // unit = text.match(/Road Size\s*:\s*([\d.]+)\s*(m|ft)?/i)?.[2]?.trim();  
            }
            
            if (text.includes('beds')) {
                beds = text.match(/beds\s*:\s*(.*)/i)?.[1]?.trim();
            }
            if (text.includes('bathrooms')) {
                bathrooms = text.match(/bathrooms\s*:\s*(.*)/i)?.[1]?.trim();
            }
            if (text.includes('Built on')) {
                builtOn = text.match(/Built on\s*:\s*(.*)/i)?.[1]?.trim();
            }
            if (text.includes('land area')) {
                landArea = text.match(/land area\s*:\s*(.*)/i)?.[1]?.trim();
            }
        });

    
        // For extracting price
        $('.banner-sub-title h4').each((index, element) => {
            let priceText = $(element).text().trim();
            
            // Handle "crore" and "lakh"
            let croreMatch = priceText.match(/(\d+)\s*crore/i);
            let lakhMatch = priceText.match(/(\d+)\s*lakhs?/i);
            
            let croreValue = croreMatch ? parseInt(croreMatch[1]) * 10000000 : 0;
            let lakhValue = lakhMatch ? parseInt(lakhMatch[1]) * 100000 : 0;
            
            // If the price contains both crore and lakh, calculate the total price
            if (croreValue > 0 || lakhValue > 0) {
                let totalValue = croreValue + lakhValue;
                price = totalValue;
            } else {
                // Handle "NPR", "Rs" formats, and optional trailing "/-" or "\-"
                let match = priceText.match(/NPR\s*([\d,]+)|Npr\s*([\d,]+)|npr\s*([\d,]+)|Rs\s*([\d,]+)([\/\\]\-)?/i);
                if (match) {
                    let matchedPrice = match[1] || match[2] || match[3] || match[4]; // Capture the correct matched group
                    if (matchedPrice) {
                        price = matchedPrice.replace(/,/g, ''); // Remove commas
                    }
                }
            }
        
        });
        
        
        
        
          
        // For extracting location
        $('.overview-sub-title h5').each((index, element) => {
            const locationText = $(element).text().trim();

            if (locationText.includes('location')) {
                location = locationText.match(/location\s*:\s*(.*)/i)?.[1]?.trim(); 
            }
        })

        return {
            roadSize,
            beds,
            bathrooms,
            builtOn,
            landArea,
            price,
            location
        };
        
       

    }
    

    async scrape() {
        let currentPage = 1;
        let currentUrl = this.baseUrl;
        let allCards = [];
   

        while (currentPage <= this.maxPages && currentUrl) {
            // console.log(`Scraping page ${currentPage}: ${currentUrl}`);
            const html = await this.fetchHTML(currentUrl);

            if (html) {
                const cardUrls = this.extractCardUrls(html);
                console.log("This is the detiall of")
                

                for (const cardUrl of cardUrls) {
                    const cardHtml = await this.fetchHTML(cardUrl);
                
                    if (cardHtml) {
                        const cardDetails = this.extractCardDetails(cardHtml);
                        allCards.push(cardDetails);
                    }
                }

                currentUrl = this.getNextPageUrl(html);
            } else {
                break;
            }
            currentPage++;
        }
    
        return allCards;
     
    }

    getNextPageUrl(html) {
        const $ = cheerio.load(html);
        const nextPageLink = $('.page-link').attr('href'); 


        return nextPageLink ? new URL(nextPageLink, this.baseUrl).href : null;
    }
}

export default CardScraper;
