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

document.addEventListener("DOMContentLoaded", () => {
  const dependentsList = document.querySelectorAll(".dependent-checkbox");
  const seatNumbersContainer = document.getElementById("seatNumbers");
  const trainCapacity = parseInt(
    document.getElementById("trainCapacity").value,
    10,
  );
  const availableSeats = parseInt(
    document.getElementById("availableSeats").value,
    10,
  );

  function updateSeats() {
    // Calculate total seats (1 for the user + checked dependents)
    const selectedDependents = Array.from(dependentsList).filter(
      (cb) => cb.checked,
    ).length;
    const totalSeats = selectedDependents + 1;

    // Update the seat input fields
    while (seatNumbersContainer.children.length < totalSeats) {
      const input = document.createElement("input");
      input.type = "text";
      input.name = "seatNumber[]";
      input.placeholder = "Seat number";
      input.required = true;
      seatNumbersContainer.appendChild(input);
    }

    while (seatNumbersContainer.children.length > totalSeats) {
      seatNumbersContainer.removeChild(seatNumbersContainer.lastChild);
    }

    // Update values of seat inputs dynamically
    for (let i = 0; i < totalSeats; i++) {
      const seatNumber = trainCapacity - availableSeats + i + 1;
      seatNumbersContainer.children[i].value = seatNumber;
    }
  }

  // Listen for changes to dependent checkboxes
  dependentsList.forEach((cb) => {
    cb.addEventListener("change", updateSeats);
  });

  // Initialize with one seat for the user
  updateSeats();
});

document.addEventListener("DOMContentLoaded", () => {
  const dependentsCheckboxes = document.querySelectorAll(".dependent-checkbox");
  const trainCapacity = parseInt(
    document.getElementById("trainCapacity").value,
    10,
  );
  const availableSeats = parseInt(
    document.getElementById("availableSeats").value,
    10,
  );
  const amountInput = document.getElementById("amount");
  const calculatedAmountInput = document.getElementById("calculatedAmount");
  const ticketPrice = parseFloat(
    document.getElementById("ticketPrice")?.value || 0,
  );
  const loyaltyDiscount = parseFloat(
    document.getElementById("loyaltyDiscount")?.value || 0,
  );
  const vatRate = 0.15; // VAT rate (15%)

  function calculateTotalPayment() {
    // Calculate the number of tickets (user + dependents)
    const selectedDependents = Array.from(dependentsCheckboxes).filter(
      (cb) => cb.checked,
    ).length;
    const totalTickets = selectedDependents + 1; // Add 1 for the user

    // Calculate the base amount for all tickets
    const baseAmount = totalTickets * ticketPrice;

    // Calculate loyalty discount for the user
    const userDiscount =
      loyaltyDiscount > 0 ? (ticketPrice * loyaltyDiscount) / 100 : 0;

    // Apply the discount for the user
    const discountedAmount = baseAmount - userDiscount;

    // Apply VAT
    const totalWithVAT = discountedAmount * (1 + vatRate);

    // Update the input fields
    calculatedAmountInput.value = totalWithVAT.toFixed(2); // Display total with VAT
    amountInput.value = totalWithVAT.toFixed(2); // Set total in the hidden input for submission
  }

  // Listen for changes to dependent checkboxes
  dependentsCheckboxes.forEach((cb) => {
    cb.addEventListener("change", calculateTotalPayment);
  });

  // Initialize the total payment amount
  calculateTotalPayment();
});

document.addEventListener("DOMContentLoaded", () => {
  const dependentsCheckboxes = document.querySelectorAll(".dependent-checkbox");
  const bookingForm = document.getElementById("bookingForm");

  // Listen for changes to each dependent checkbox
  dependentsCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const dependentName = checkbox.getAttribute("data-name");

      if (checkbox.checked) {
        // Create a hidden input for the dependent's name
        const hiddenInput = document.createElement("input");
        hiddenInput.type = "hidden";
        hiddenInput.name = "dependentNames[]"; // Ensure it matches the server field name
        hiddenInput.value = dependentName;
        hiddenInput.dataset.personId = checkbox.value; // Add a unique identifier
        bookingForm.appendChild(hiddenInput);
      } else {
        // Remove the hidden input if the checkbox is unchecked
        const hiddenInput = bookingForm.querySelector(
          `input[name="dependentNames[]"][data-person-id="${checkbox.value}"]`,
        );
        if (hiddenInput) bookingForm.removeChild(hiddenInput);
      }
    });
  });
});
