// To show and hide login form
document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.querySelector('.log_in');
    console.log()
    const loginFormSection = document.querySelector('.login_form_section');
    const closeButton = document.querySelector('.login_form_section .fa-circle-xmark');
  
    // Show login form
    loginButton.addEventListener('click', () => {
      loginFormSection.classList.add('visible');
    });
  
    // Hide login form when close icon is clicked
    closeButton.addEventListener('click', () => {
      loginFormSection.classList.remove('visible');
    });
  
    const form = document.getElementById("logIn_form");

    form.addEventListener("submit", (event) => {
      event.preventDefault(); 
      
    
      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;
  
      
      if (username === "admin" && password === "admin") {
       
        window.location.href = "/frontend/assests/include/adminDashboard.html"; 
      } else {
        swal({
            title: " Errors",
            text: "Invalid Username or Password",
            icon: "warning",
            button: "OK"
        });
      }
    });
  });