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
