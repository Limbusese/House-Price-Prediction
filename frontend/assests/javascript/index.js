const getPriceButtons = document.querySelectorAll(".hero_section_informationBtn");
const formSecondFieldBtn = document.querySelector(".form_second_field_radioBtn");

console.log(formSecondFieldBtn)

getPriceButtons.forEach(button => {
    button.addEventListener("click", () => {
        formSecondFieldBtn.classList.toggle("show");
    });
});
