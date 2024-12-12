document.addEventListener("DOMContentLoaded", () => {
  // Get references to the filters and table
  const departureCityFilter = document.getElementById("departureCityFilter");
  const arrivalCityFilter = document.getElementById("arrivalCityFilter");
  const trainNameFilter = document.getElementById("trainNameFilter");
  const table = document.getElementById("trainTable");
  const rows = Array.from(table.querySelectorAll("tbody tr"));

  // Filter function
  function filterTable() {
    const depCityValue = departureCityFilter.value.toLowerCase();
    const arrCityValue = arrivalCityFilter.value.toLowerCase();
    const trainNameValue = trainNameFilter.value.toLowerCase();

    rows.forEach((row) => {
      const fromStationCell = row.cells[3].textContent.toLowerCase(); // From Station (updated column index)
      const toStationCell = row.cells[4].textContent.toLowerCase(); // To Station (updated column index)
      const englishNameCell = row.cells[2].textContent.toLowerCase(); // Train English Name (updated column index)

      // Show/hide rows based on the filters
      const depCityMatch = !depCityValue || fromStationCell === depCityValue;
      const arrCityMatch = !arrCityValue || toStationCell === arrCityValue;
      const trainNameMatch =
        !trainNameValue || englishNameCell.includes(trainNameValue);

      if (depCityMatch && arrCityMatch && trainNameMatch) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }

  // Add event listeners to the filters
  departureCityFilter.addEventListener("change", filterTable);
  arrivalCityFilter.addEventListener("change", filterTable);
  trainNameFilter.addEventListener("input", filterTable);
});

document.addEventListener("DOMContentLoaded", () => {
  // Add event listener to all "Book" buttons
  const bookButtons = document.querySelectorAll(".book-btn");
  const bookingModal = document.getElementById("bookingModal");
  const bookingDetails = document.getElementById("bookingDetails");

  bookButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      // Get the row of the clicked button
      const row = event.target.closest("tr");

      // Extract information from the row's cells
      const trainID = row.cells[0].textContent;
      const arabicName = row.cells[1].textContent;
      const englishName = row.cells[2].textContent;
      const fromStation = row.cells[3].textContent;
      const toStation = row.cells[4].textContent;
      const depTime = row.cells[5].textContent;
      const arrTime = row.cells[6].textContent;
      const fare = row.cells[7].textContent;
      const availableSeats = row.cells[8].textContent;

      // Format and display the details in the modal
      bookingDetails.innerHTML = `
            <strong>Train ID:</strong> ${trainID}<br>
            <strong>Arabic Name:</strong> ${arabicName}<br>
            <strong>English Name:</strong> ${englishName}<br>
            <strong>From Station:</strong> ${fromStation}<br>
            <strong>To Station:</strong> ${toStation}<br>
            <strong>Departure Time:</strong> ${depTime}<br>
            <strong>Arrival Time:</strong> ${arrTime}<br>
            <strong>Fare:</strong> ${fare}<br>
            <strong>Available Seats:</strong> ${availableSeats}<br>
        `;

      // Show the modal
      bookingModal.style.display = "flex";
    });
  });
});

// Function to close the modal
function closeModal() {
  document.getElementById("bookingModal").style.display = "none";
}

// Parse the query parameters from the URL
const params = new URLSearchParams(window.location.search);

// Check if there is an error message
const errorMessage = params.get("error");

if (errorMessage) {
  // Display the error message in an alert or on the page
  alert(errorMessage);

  // Optionally, clear the query parameter after displaying the message
  window.history.replaceState({}, document.title, window.location.pathname);
}

function downloadPDF() {
  window.open("/generate-active-trains-pdf", "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  const rows = Array.from(document.querySelectorAll("#trainTable tbody tr"));

  rows.forEach((row) => {
    const classSelect = row.querySelector(".class-select");
    const priceCell = row.querySelector(".price");

    classSelect.addEventListener("change", () => {
      const basePrice = parseFloat(
        priceCell.dataset.basePrice || priceCell.textContent.replace("$", ""),
      );
      const isBusiness = classSelect.value === "Business";
      const updatedPrice = isBusiness ? basePrice + 20 : basePrice;

      // Update the price display
      priceCell.textContent = `$${updatedPrice}`;
      // Save the base price in the data attribute
      priceCell.dataset.basePrice = basePrice;
    });
  });
});
