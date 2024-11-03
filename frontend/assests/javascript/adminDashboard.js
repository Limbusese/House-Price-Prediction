document.addEventListener("DOMContentLoaded", async () => {
     // To add active class
     const activeListButton = document.querySelector(".dashboard_lists li");
     activeListButton.classList.toggle("active");

    async function fetchDataAPI() {
      try {
        const response = await fetch('http://localhost:8020/api/getCsvRows', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const result = await response.json();
        console.log("API response:", result);
  
        const trainDataElement = document.querySelector(".model_train_data_numbers article[data-target]");
        const testDataElement = document.querySelector(".model_test_data_numbers article[data-target]");
        
        trainDataElement.setAttribute("data-target", result.trainDataRows);
        testDataElement.setAttribute("data-target", result.testDataRows);
  
        countUp(trainDataElement);
        countUp(testDataElement);
  
      } catch (error) {
        console.error("Error fetching API:", error);
      }
    }
  
    // Function to animate count-up
    function countUp(element) {
      const target = parseFloat(element.getAttribute("data-target"));
      const isDecimal = target % 1 !== 0;
      const increment = isDecimal ? target / 100 : Math.ceil(target / 100); // Adjust for speed
      let current = parseFloat(element.innerText) || 0;
  
      const updateCount = () => {
        if (current < target) {
          current += increment;
          element.innerText = current.toFixed(isDecimal ? 4 : 0); // Adjust precision
          setTimeout(updateCount, 30);
        } else {
          element.innerText = target.toFixed(isDecimal ? 4 : 0);
        }
      };
  
      updateCount();
    }
  
    fetchDataAPI();

    // To redirect to homepage
    const logoSection = document.querySelector(".logo_section");

    logoSection.addEventListener("click", () => {
      window.location.href = "/frontend/index.html";
    })
  });
  