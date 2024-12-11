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

module.exports = router;
