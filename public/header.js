// Add the event listener here
document.addEventListener("DOMContentLoaded", function () {
  const logoutButton = document.getElementById("logoutBtn");

  if (logoutButton) {
    logoutButton.addEventListener("click", function () {
      const userConfirmed = confirm("Are you sure you want to logout?");
      if (userConfirmed) {
        window.location.href = "login"; // Replace with your target page
      }
    });
  }
});

// Parse the query parameters from the URL
const params = new URLSearchParams(window.location.search);

// Check for error and success messages
const errorMessage = params.get("error");
const successMessage = params.get("success");

if (errorMessage) {
  // Display the error message in an alert or on the page
  alert(`Error: ${errorMessage}`);

  // Optionally, clear the query parameter after displaying the message
  window.history.replaceState({}, document.title, window.location.pathname);
}

if (successMessage) {
  // Display the success message in an alert or on the page
  alert(`Success: ${successMessage}`);

  // Optionally, clear the query parameter after displaying the message
  window.history.replaceState({}, document.title, window.location.pathname);
}
