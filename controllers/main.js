const db = require("../models/database");
const puppeteer = require("puppeteer");

exports.getLogin = (req, res, next) => {
  res.render("login");
};

exports.getIndex = (req, res, next) => {
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
  res.render("Payment", {
    username: req.session.username,
    role: req.session.role,
  });
};

exports.getTickets = (req, res, next) => {
  const tickets = [
    {
      route: "Phnom Penh → Kompong Thom",
      date: "Oct 30",
      timeBooking: "9:40 PM",
      car: "Car-00BAC",
      price: "$55.00",
      paymentStatus: "Done Payment",
    },
    {
      route: "Phnom Penh → Siem Reap",
      date: "Nov 1",
      timeBooking: "10:00 AM",
      car: "Car-01DEF",
      price: "$65.00",
      paymentStatus: "Pending Payment",
    },
    {
      route: "Phnom Penh → Battambang",
      date: "Nov 5",
      timeBooking: "8:00 AM",
      car: "Car-02GHI",
      price: "$45.00",
      paymentStatus: "Done Payment",
    },
  ];

  // Render the tickets template with the dynamic ticket data
  res.render("ticket", {
    tickets,
    username: req.session.username,
    role: req.session.role,
  });
};

exports.getDashboard = (req, res, next) => {
  res.render("dashboard");
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
