document.addEventListener("DOMContentLoaded", function () {
    async function handleDataSubmission() {
        const receivedData = window.submittedData;

        if (receivedData && receivedData.person) {
            console.log('Received form data:', receivedData);

            // Create a new object excluding the 'person' key
            const dataForAPI = { ...receivedData };
            delete dataForAPI.person;

            // Check the person type and call the appropriate API
            if (receivedData.person === 'buyer') {
                await fetchBuyerAPI(dataForAPI);
            } else if (receivedData.person === 'seller') {
                await fetchSellerAPI(dataForAPI);
            } else {
                console.log("Unknown person type.");
            }
        } else {
            console.log("No valid data received.");
        }
    }

    // Async function for fetching buyer API
    async function fetchBuyerAPI(data) {
        try {
            const response = await fetch('http:// localhost:8020/api/predictBuyerHousePrice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const result = await response.json();
            console.log("Buyer API response:", result);
        } catch (error) {
            console.error("Error fetching buyer API:", error);
        }
    }

    // Async function for fetching seller API
    async function fetchSellerAPI(data) {
        console.log("buyer's data:", data)
        try {
            const response = await fetch('http://localhost:8020/api/predictHousePrice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            console.log("Seller API response:", result);
        } catch (error) {
            console.error("Error fetching seller API:", error);
        }
    }

    // Listen for the custom 'dataSubmitted' event
    window.addEventListener("dataSubmitted", handleDataSubmission);
});
