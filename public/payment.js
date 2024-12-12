document.addEventListener("DOMContentLoaded", () => {
  const bookForDependentsCheckbox = document.getElementById(
    "bookForDependentsCheckbox",
  );
  const dependentsSection = document.getElementById("dependentsSection");

  // Toggle the visibility of the dependents section
  bookForDependentsCheckbox.addEventListener("change", () => {
    if (bookForDependentsCheckbox.checked) {
      dependentsSection.style.display = "block"; // Show dependents section
    } else {
      dependentsSection.style.display = "none"; // Hide dependents section
    }
  });
});
