const db = require("../models/database");
const puppeteer = require("puppeteer");

exports.getLogin = (req, res, next) => {
  res.render("login");
};

exports.getIndex = (req, res, next) => {
  console.log(req.session);
  res.render("index", {
    username: req.session.username,
    role: req.session.role,
  });
};

exports.getTrains = (req, res, next) => {
  try {
    const trains = db.getTripsDetails(); // Fetch train data
    res.render("Trains", {
      username: req.session.username,
      role: req.session.role,
      trains,
    });
  } catch (error) {
    console.error("Error fetching train data:", error);
    res.status(500).send("Server Error");
  }
};

exports.getPayment = (req, res, next) => {
  console.log(req.session.user);
  const Trip = req.query;
  Trip["capacity"] = db.getTrainCapacity(db.getTrainIDByTripID(Trip.TripID));
  Trip["availableSeats"] = db.getAvailableSeats(Trip.TripID);
  console.log(Trip);
  res.render("Payment", {
    username: req.session.username,
    role: req.session.role,
    dependents: db.getDependentsByPersonID(req.session.user.PersonID),
    trip: Trip,
    user: req.session.user,
  });
};

exports.getTickets = (req, res, next) => {
  res.render("ticket", {
    tickets,
    username: req.session.username,
    role: req.session.role,
  });
};

exports.getDashboard = (req, res, next) => {
  res.render("dashboard", {
    username: req.session.username,
    role: req.session.role,
    totalTrains: db.getTotalTrains(),
    totalApprovedTickets: db.getTotalPaidTickets(),
    totalPassengers: db.getTotalPassengers(),
    totalPendingTickets: db.getTotalPendingTickets(),
    totalStaff: db.getAllStaff(),
    Trips: db.getTripsDetails(),
  });
};

exports.postTrip = (req, res) => {
  const {
    sequenceNumber,
    arrivalTime,
    departureTime,
    price,
    availableSeats,
    distance,
    stationID,
    fromStationID,
    trainID,
  } = req.body;

  try {
    const tripID = insertTrip({
      sequenceNumber,
      arrivalTime,
      departureTime,
      price,
      availableSeats,
      distance,
      stationID,
      fromStationID,
      trainID,
    });

    res.status(201).redirect("/trains"); // Redirect to the trains page
  } catch (error) {
    console.error("Error in route:", error.message);
    // Redirect to trains page with error message in query
    res.redirect(
      `/trains?error=${encodeURIComponent("Failed to add trip. Please try again.")}`,
    );
  }
};

exports.latePayment = (req, res) => {
  const ticketId = req.body.ticketId;
  console.log(ticketId);
  if (!ticketId) {
    return res.redirect(`/tickets?error=Invalid Ticket ID.`);
  }

  try {
    // Call the database function to update payment status
    const result = db.updatePaymentStatus(ticketId);

    // On success, redirect with a success message
    res.redirect(`/tickets?success=${encodeURIComponent(result.message)}`);
  } catch (err) {
    // Handle errors (either database errors or ticket not found)
    console.error(err.message);
    res.redirect(`/tickets?error=${encodeURIComponent(err.message)}`);
  }
};

exports.handlePayment = async (req, res) => {
  const {
    bookForDependents,
    "dependentList[]": rawDependentIds,
    "dependentNames[]": rawDependentNames,
    "seatNumber[]": rawSeatNumbers,
    trainCapacity,
    availableSeats,
    tripId: rawTripIds,
    ticketPrice,
    loyaltyDiscount,
    amount,
    calculatedAmount,
    selectedClass,
    code,
  } = req.body;
  // Normalize arrays
  const dependentIds = Array.isArray(rawDependentIds)
    ? rawDependentIds
    : [rawDependentIds].filter(Boolean);
  const dependentNames = Array.isArray(rawDependentNames)
    ? rawDependentNames
    : [rawDependentNames].filter(Boolean);
  const seatNumbers = Array.isArray(rawSeatNumbers)
    ? rawSeatNumbers
    : [rawSeatNumbers].filter(Boolean);
  const tripIds = Array.isArray(rawTripIds)
    ? rawTripIds
    : [rawTripIds].filter(Boolean);

  // Extract the first trip ID (assuming only one trip is relevant)
  const tripId = tripIds[0] || null;

  //   console.log({
  //     bookForDependents,
  //     dependentIds,
  //     dependentNames,
  //     seatNumbers,
  //     trainCapacity: parseInt(trainCapacity, 10),
  //     availableSeats: parseInt(availableSeats, 10),
  //     tripId,
  //     ticketPrice: parseFloat(ticketPrice),
  //     loyaltyDiscount: parseFloat(loyaltyDiscount),
  //     amount: parseFloat(amount),
  //     calculatedAmount: parseFloat(calculatedAmount),
  //   });

  const totalRequestedSeats = seatNumbers.length; // User + dependents
  const currentAvailableSeats = parseInt(availableSeats, 10);

  if (totalRequestedSeats > currentAvailableSeats) {
    // Redirect to the trains page with an error message
    try {
      const currentDate = formatDateToYYYYMMDD(new Date()); // Current date in YYYY-MM-DD format
      const departureTime = db.getDepartureTime(tripId); // Fetch the departure time
      const tempExpiryDate = calculateTempExpiryDate(departureTime); // Calculate expiry date

      // Add to the waiting list
      db.addToWaitingList({
        reservationDate: currentDate,
        tempReservationExpiryDate: tempExpiryDate,
        status: 0,
        passengerId,
        tripId,
        personId,
      });

      // Redirect with success message
      return res.redirect(
        `/trains?success=${encodeURIComponent(
          `Insufficient seats available. You have been added to the waiting list. Your reservation will expire on ${tempExpiryDate}.`,
        )}`,
      );
    } catch (error) {
      console.error("Error processing waiting list:", error.message);

      // Redirect with error message
      return res.redirect(
        `/trains?error=${encodeURIComponent(
          "An error occurred while adding you to the waiting list. Please try again.",
        )}`,
      );
    }
  }

  try {
    // Check if payment code is provided
    const isPaid = code && code.trim().length > 0 ? "Yes" : "No";
    const ticketStatus = isPaid ? 1 : 0;

    // Process tickets based on payment status
    seatNumbers.forEach((seatNumber) => {
      db.insertTicket({
        CoachType: selectedClass, // Derive from trip details if needed
        TicketStatus: ticketStatus,
        SeatNumber: seatNumber,
        IsPaid: isPaid + "",
        TotalAmount: ticketPrice, // Adjust for loyalty discount if applicable
        PersonID: req.session.user.PersonID,
        TripID: tripId,
      });
    });

    // Redirect with appropriate success message
    const successMessage = isPaid
      ? "Tickets have been successfully booked and payment is confirmed!"
      : "Tickets have been reserved. Please complete payment later.";
    return res.redirect(
      `/tickets?success=${encodeURIComponent(successMessage)}`,
    );
  } catch (error) {
    console.error("Error adding tickets:", error.message);

    // Redirect with an error message
    return res.redirect(
      `/tickets?error=${encodeURIComponent(
        "An error occurred while processing your tickets. Please try again.",
      )}`,
    );
  }
};

exports.deleteTicket = (req, res) => {
  const { ticketId } = req.body;

  //   if (!ticketId) {
  //     return res.redirect(`/tickets?error=Invalid Ticket ID.`);
  //   }

  try {
    db.deleteTicketById(ticketId);
    res.redirect(`/tickets?success=Ticket deleted successfully.`);
  } catch (err) {
    res.redirect(`/tickets?error=${encodeURIComponent(err.message)}`);
  }
};

function calculateTempExpiryDate(departureTime) {
  const expiryDate = new Date(departureTime);
  expiryDate.setDate(expiryDate.getDate() - 1); // Subtract 1 day
  return formatDateToYYYYMMDD(expiryDate); // Return date in YYYY-MM-DD format
}

function formatDateToYYYYMMDD(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
