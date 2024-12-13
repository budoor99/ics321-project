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
  const bookButtons = document.querySelectorAll(".book-btn");
  const bookingModal = document.getElementById("bookingModal");
  const confirmationDetails = document.getElementById("confirmationDetails");
  const confirmButton = document.getElementById("confirmBooking");
  let selectedTrainData = {}; // Store selected train data

  // Add event listener to each Book button
  bookButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const row = button.closest("tr");

      // Extract train data from the row
      selectedTrainData = {
        TripID: row.querySelector("td:nth-child(1)").textContent.trim(),
        arabicName: row.querySelector("td:nth-child(2)").textContent.trim(),
        englishName: row.querySelector("td:nth-child(3)").textContent.trim(),
        fromStation: row.querySelector("td:nth-child(4)").textContent.trim(),
        toStation: row.querySelector("td:nth-child(5)").textContent.trim(),
        departureTime: row.querySelector("td:nth-child(6)").textContent.trim(),
        arrivalTime: row.querySelector("td:nth-child(7)").textContent.trim(),
        price: row.querySelector(".price").textContent.trim().replace("$", ""),
        selectedClass: row.querySelector(".class-select").value,
      };

      // Populate the modal with the booking details
      confirmationDetails.innerHTML = `
                <p><strong>Train ID:</strong> ${selectedTrainData.trainID}</p>
                <p><strong>Arabic Name:</strong> ${selectedTrainData.arabicName}</p>
                <p><strong>English Name:</strong> ${selectedTrainData.englishName}</p>
                <p><strong>From Station:</strong> ${selectedTrainData.fromStation}</p>
                <p><strong>To Station:</strong> ${selectedTrainData.toStation}</p>
                <p><strong>Departure Time:</strong> ${selectedTrainData.departureTime}</p>
                <p><strong>Arrival Time:</strong> ${selectedTrainData.arrivalTime}</p>
                <p><strong>Class:</strong> ${selectedTrainData.selectedClass}</p>
                <p><strong>Price:</strong> $${selectedTrainData.price}</p>
            `;

      // Show the modal
      bookingModal.style.display = "flex";
    });
  });

  // Confirm Booking
  confirmButton.addEventListener("click", () => {
    // Redirect to the payment page with the data
    const params = new URLSearchParams(selectedTrainData).toString();
    window.location.href = `/payment?${params}`;
  });

  // Close Modal
  function closeModal() {
    bookingModal.style.display = "none";
  }

  window.closeModal = closeModal; // Expose function globally
});

// Function to close the modal
function closeModal() {
  document.getElementById("bookingModal").style.display = "none";
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
