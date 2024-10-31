const getPriceButtons = document.querySelectorAll(".hero_section_informationBtn");
const formSecondFieldBtn = document.querySelector(".form_second_field_radioBtn");
const formRadioGroup = document.querySelector(".form_second_field");

console.log(formSecondFieldBtn)

getPriceButtons.forEach(button => {
    button.addEventListener("click", () => {
        formSecondFieldBtn.classList.toggle("show");
        formRadioGroup.classList.toggle("show");
    });
});


// To show and hide card layut
const cardLayout = document.querySelector(".card_section");
const exitLogo = document.querySelector(".card_section_layout_exit i");

exitLogo.addEventListener("click", () => {
    cardLayout.classList.toggle("hide");
})