const modal = document.getElementById("ticketModal");
const ticketTable = document
  .getElementById("ticketTable")
  .getElementsByTagName("tbody")[0];

function openAddTicketModal() {
  document.getElementById("modalTitle").innerText = "Add Ticket";
  modal.style.display = "flex";
}

function closeModal() {
  modal.style.display = "none";
}

function submitTicket(event) {
  event.preventDefault();
  const trainNumber = document.getElementById("trainNumber").value;
  const trainName = document.getElementById("trainName").value;
  const route = document.getElementById("route").value;
  const departureTime = document.getElementById("departureTime").value;
  const fare = document.getElementById("fare").value;

  const newRow = ticketTable.insertRow();
  newRow.innerHTML = `
        <td>${trainNumber}</td>
        <td>${trainName}</td>
        <td>${route}</td>
        <td>${departureTime}</td>
        <td>$${fare}</td>
        <td>---</td>
        <td>
            <button class="action-btn update-btn" onclick="editTicket(this)">Update</button>
            <button class="action-btn delete-btn" onclick="deleteTicket(this)">Delete</button>
            <button class="action-btn view-btn" onclick="viewTicket(this)">View</button>
        </td>
    `;
  closeModal();
}

function deleteTicket(button) {
  const userConfirmed = confirm("Are you sure you want to logout?");
  if (userConfirmed) {
    const row = button.closest("tr");
    ticketTable.deleteRow(row.rowIndex - 1);
  }
}

function editTicket(button) {
  openAddTicketModal();
  document.getElementById("modalTitle").innerText = "Edit Ticket";
}

function viewTicket(button) {
  alert("View Ticket Details: Functionality coming soon!");
}

document.addEventListener("DOMContentLoaded", () => {
  // Simulating backend data for staff and trains
  const staffList = [
    "John Doe",
    "budor",
    "Jane Smith",
    "Michael Brown",
    "Emily Davis",
  ];
  const trainList = ["Train-001", "Train-002", "Train-003", "Train-004"];

  // Populate Staff Name Dropdown
  const staffNameDropdown = document.getElementById("staffName");
  staffList.forEach((staff) => {
    const option = document.createElement("option");
    option.value = staff;
    option.textContent = staff;
    staffNameDropdown.appendChild(option);
  });

  // Populate Train Number Dropdown
  const trainNumberDropdown = document.getElementById("trainNumber");
  trainList.forEach((train) => {
    const option = document.createElement("option");
    option.value = train;
    option.textContent = train;
    trainNumberDropdown.appendChild(option);
  });
});

// Handle Form Submission
function submitAssignment() {
  const staffName = document.getElementById("staffName").value;
  const role = document.getElementById("role").value;
  const trainNumber = document.getElementById("trainNum").value;
  const description = document.getElementById("modal-description");
  const assignModal = document.getElementById("assignModal");

  if (!staffName || !role || !trainNumber) {
    alert("Please fill all fields before assigning staff.");
    return;
  }

  description.innerHTML = ` Are you sure you want to assign ${staffName} as a ${role} to the ${trainNumber}?`;
  assignModal.style.display = "flex";
}

function openModal() {
  const modal = document.getElementById("assignModal");
  modal.style.display = "flex"; // Show the modal
}

function closeModal() {
  const modal = document.getElementById("assignModal");
  modal.style.display = "none"; // Hide the modal
}

function confirmAssignment() {
  alert("Assignment confirmed!");
  closeModal(); // Close the modal after confirmation
}

// Open Modify Modal
function openModifyModal(
  tripId,
  price,
  availableSeats,
  departureTime,
  arrivalTime,
) {
  document.getElementById("tripId").value = tripId; // Set Trip ID
  document.getElementById("price").value = price; // Set Price
  document.getElementById("availableSeats").value = availableSeats; // Set Available Seats
  document.getElementById("departureTime").value = departureTime; // Set Departure Time
  document.getElementById("arrivalTime").value = arrivalTime; // Set Arrival Time

  document.getElementById("modifyModal").style.display = "block"; // Show Modal
}

// Close Modify Modal
function closeModifyModal() {
  document.getElementById("modifyModal").style.display = "none"; // Hide Modal
}

// Handle Modify Form Submission
document
  .getElementById("modifyTripForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const tripId = document.getElementById("tripId").value;
    const price = parseFloat(document.getElementById("price").value);
    const availableSeats = parseInt(
      document.getElementById("availableSeats").value,
      10,
    );
    const departureTime = new Date(
      document.getElementById("departureTime").value,
    );
    const arrivalTime = new Date(document.getElementById("arrivalTime").value);

    // Validation: Check if availableSeats is valid
    const originalAvailableSeats = parseInt(
      document.getElementById("availableSeats").getAttribute("data-original"),
      10,
    );
    if (availableSeats < originalAvailableSeats) {
      alert("Available seats cannot be less than the original count.");
      return; // Prevent submission
    }

    // Validation: Check if departure time is before arrival time
    if (departureTime >= arrivalTime) {
      alert("Departure time must be before the arrival time.");
      return; // Prevent submission
    }

    // If validation passes, proceed with form submission
    fetch(`/modify-trip/${tripId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        price,
        availableSeats,
        departureTime,
        arrivalTime,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Trip modified successfully.");
          closeModifyModal();
          location.reload(); // Refresh the page to update the table
        } else {
          alert("Failed to modify the trip: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error modifying trip:", error);
      });
  });

// Confirm Delete
function confirmDelete(tripId) {
  const isConfirmed = confirm("Are you sure you want to delete this trip?");
  if (isConfirmed) {
    fetch(`/delete-trip/${tripId}`, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Trip deleted successfully.");
          location.reload(); // Refresh the page to update the table
        } else {
          alert("Failed to delete the trip: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error deleting trip:", error);
      });
  }
}
