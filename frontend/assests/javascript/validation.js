let submittedData = [];
console.log("submittedData:", submittedData)

document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector('#send');
    const predictButton = document.getElementById('predictButton');
    const messageSpan = document.querySelector("#messageSpan");

    predictButton.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent the form from submitting normally

        const errors = [];

        // Field validation logic as before
        const locationInput = form.querySelector('input[name="location"]');
        const roadSizeInput = form.querySelector('input[name="roadSie"]');
        const bedroomsInput = form.querySelector('input[name="bedrooms"]');
        const bathroomsInput = form.querySelector('input[name="bathrooms"]');
        const landSizeInput = form.querySelector('input[name="landSize"]');
        const builtOnInput = form.querySelector('input[name="builtOn"]');
        const personInputs = form.querySelectorAll('input[name="person"]');

        // Validations for each field
        if (!locationInput.value.trim()) errors.push("Location is required");
        if (!roadSizeInput.value.trim()) {
            errors.push("Road size is required");
        } else if (isNaN(roadSizeInput.value) || parseInt(roadSizeInput.value) < 1) {
            errors.push("Road size must be a positive number");
        }
        if (!bedroomsInput.value.trim()) {
            errors.push("Number of bedrooms is required");
        } else if (isNaN(bedroomsInput.value) || parseInt(bedroomsInput.value) < 1) {
            errors.push("Bedrooms must be a positive number");
        }
        if (!bathroomsInput.value.trim()) {
            errors.push("Number of bathrooms is required");
        } else if (isNaN(bathroomsInput.value) || parseInt(bathroomsInput.value) < 1) {
            errors.push("Bathrooms must be a positive number");
        }
        if (!landSizeInput.value.trim()) {
            errors.push("Land size is required");
        } else {
            const annaDamPattern = /^\d+\s*Anna(\s*\d+\s*Dam)?$/i;
            
            if (!annaDamPattern.test(landSizeInput.value)) {
                errors.push("Land size must be in the format 'X Anna' or 'X Anna Y Dam' with non-negative numbers");
            }
        }
        
        if (!builtOnInput.value.trim()) {
            errors.push("Built-on year is required");
        } else {
            const builtOnYear = parseInt(builtOnInput.value);
            
            // Validate for BS year range, approximately between 2000 and 2090
            if (isNaN(builtOnYear) || builtOnYear < 2000 || builtOnYear > 2090) {
                errors.push("Enter a valid built-on year in the Nepali BS format (e.g., between 2000 and 2090)");
            }
        }

        let personType = '';
        personInputs.forEach(input => {
            if (input.checked) {
                personType = input.value;
            }
        });

        if (!personType) errors.push("Please select if you are buying or selling");

        // Display errors if there are any
        if (errors.length > 0) {
            swal({
                title: "Form Errors",
                text: errors.map(error => `* ${error}`).join("\n"),
                icon: "warning",
                button: "OK"
            });
            return;
        }

        // If no errors, proceed with form submission
        const formData = {
            location: locationInput.value.trim(),
            roadSize: parseInt(roadSizeInput.value),
            bedrooms: parseInt(bedroomsInput.value),
            bathrooms: parseInt(bathroomsInput.value),
            landArea: parseFloat(landSizeInput.value),
            builtOn: parseInt(builtOnInput.value),
            person: personType
        };

        window.submittedData = formData;
        console.log("Form Data Submitted:", formData);
        
        const dataSubmittedEvent = new Event("dataSubmitted");
        window.dispatchEvent(dataSubmittedEvent);

        // Show success message
        swal({
            title: "Success! Form Submitted",
            text: "Please Wait for a moment!!!",
            icon: "success",
            // button: "OK"
        }).then(() => {
            form.reset(); 
        });
    });
});
