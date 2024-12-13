const path = require("path");
const express = require("express");
const router = express.Router();

const mainController = require("../controllers/main");
const report = require("../services/reports");

router.get("/login", mainController.getLogin);

router.get("/", mainController.getIndex);

router.get("/trains", mainController.getTrains);

router.get("/payment", mainController.getPayment);

router.get("/tickets", mainController.getTickets);

router.get("/dashboard", mainController.getDashboard);

router.post("/insert-trip", mainController.postTrip);

router.get("/trains/generate-report", report.activeTrainsReport);

router.post("/process-payment", mainController.handlePayment);

router.post("/pay-ticket", mainController.latePayment);
router.post("/delete-ticket", mainController.deleteTicket);
router.put("/modify-trip/:tripId", (req, res) => {
  const { tripId } = req.params;
  const { price, availableSeats, departureTime, arrivalTime } = req.body;
  console.log(tripId, price);
});

module.exports = router;
