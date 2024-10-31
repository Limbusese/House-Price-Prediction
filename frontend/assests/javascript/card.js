window.addEventListener("apiResponseUpdated", function () {
    console.log("apiResponseUpdated event detected");
    const data = window.apiResponseData;
    console.log("Received data from API:", data);

    function formatPrice(price) {
        const crores = Math.floor(price / 10000000);
        const lakhs = Math.floor((price % 10000000) / 100000);
        return `${crores} Crores ${lakhs} Lakhs`;
    }


    if (data && data.facilities && data.price) {
        const container = document.querySelector(".card_section");
        const formattedPrice = formatPrice(data.price);

        if (container) {
            container.classList.add("active");

            const imageMap = {
                marketplace: './assests/images/marketplace.png',
                school: './assests/images/school.png',
                hospital: './assests/images/hospital.png',
                restaurant: './assests/images/restaurant.png',
            };

            container.innerHTML = `
            <section class="card_section">
                <section class="card_section_layout">
                    <section class="card_section_layout_exit">
                        <i class="fa-solid fa-circle-xmark fa-beat"></i>
                    </section>
                    
                    <section class="card_section_layout_price_section">
                        <section class="card_section_layout_price_section_header">
                            <section class="card_section_layout_price_amount">
                                <section class="card_section_layout_header">
                                    <article>House Price</article>
                                </section>
                                <article>
                                    <img src="./assests/images/rupee.png" alt="Rupee Icon"> &nbsp;
                                    <span>${formattedPrice}</span>
                                </article>
                            </section>
                        </section>
                    </section>

                    <section class="card_section_layout_facilities_section">
                        <section class="card_section_layout_facilities_header">
                            <article>Nearby Facilities Details</article>
                        </section>

                        <section class="card_section_layout_facilities_details">
                            ${data.facilities.map(facility => `
                                <section class="card_section_layout_facilities_card_details">
                                    <section class="card_section_layout_facilities_card_logo">
                                        <img src="${imageMap[facility.type] || './assests/images/default.png'}" alt="${facility.type} logo">
                                    </section>

                                    <section class="card_section_layout_facilities_card_information">
                                        <section class="card_section_layout_facilities_card_header">
                                            <article>${facility.name}</article>
                                        </section>

                                        <section class="card_section_layout_facilities_card_type">
                                            <article>${facility.type}</article>
                                        </section>

                                        <section class="card_section_layout_facilities_card_distance">
                                            <section class="card_section_layout_facilities_card_distance_logo">
                                                <i class="fas fa-route"></i>
                                                <span>${facility.distance.toFixed(2)}</span>
                                                <span>K.M Away</span>
                                            </section>
                                        </section>
                                    </section>
                                </section>
                            `).join('')}
                        </section>   
                    </section>
                </section>
            </section>`;

            const exitLogo = document.querySelector(".card_section_layout_exit i");
            exitLogo.addEventListener("click", () => {
                container.classList.remove("active");
                container.innerHTML = "";
            });
        } else {
            console.error("Container not found to insert facilities data.");
        }

    } else if (data && data.price) {
        const container = document.querySelector(".card_section");
        const housePrice = data.price;
        const formattedPrice = formatPrice(housePrice);

        if (container) {
            container.classList.add("active");
            container.innerHTML = `
            <section class="card_section">
                <section class="card_section_layout">
                    <section class="card_section_layout_exit">
                        <i class="fa-solid fa-circle-xmark fa-beat"></i>
                    </section>
                    
                    <section class="card_section_layout_price_section">
                        <section class="card_section_layout_price_section_header">
                            <section class="card_section_layout_price_amount">
                                <section class="card_section_layout_header">
                                    <article>House Price</article>
                                </section>
                                <article>
                                    <img src="./assests/images/rupee.png" alt="Rupee Icon"> &nbsp;
                                    <span>${formattedPrice}</span>
                                </article>
                            </section>
                        </section>
                    </section>
                </section>
            </section>`;

            const exitLogo = document.querySelector(".card_section_layout_exit i");
            exitLogo.addEventListener("click", () => {
                container.classList.remove("active");
                container.innerHTML = "";
            });
        } else {
            console.error("Container not found to insert price data.");
        }

    } else {
        console.log("No facilities or price data found.");
    }
});
