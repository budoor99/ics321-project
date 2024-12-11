const nodemailer = require("nodemailer");
const db = require("../models/database");

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // e.g., 'gmail', 'hotmail', etc. Use SMTP configuration for custom domains
  auth: {
    user: "tareeqx99@gmail.com", // Your email
    pass: "rwvt mlye fjlw hwis", // Your email's password (or app password if using Gmail)
  },
});

// Function to send an email
async function sendEmail(to, subject, text) {
  const mailOptions = {
    from: "Tareeq <tareeqx99@gmail.com>", // Sender's address
    to, // Recipient's email
    subject, // Email subject
    text, // Plain text body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    // console.log('Email sent:', info.response);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    return error;
  }
}

async function sendUnpaidTicketReminders() {
  const unpaidTickets = db.getScheduledUnpaidTickets();

  unpaidTickets.forEach(async (ticket) => {
    const emailMessage = `
            Dear ${ticket.PassengerFirstName} ${ticket.PassengerLastName},

            This is a reminder that your ticket (Ticket ID: ${ticket.TicketID}) for the trip from ${ticket.FromStation} to ${ticket.ToStation} is unpaid.

            Departure Time: ${ticket.DepartureTime}
            Total Amount Due: ${ticket.TotalAmount}

            Please make the payment as soon as possible to confirm your ticket.
        `;

    // Send the email
    await sendEmail(
      "tareeqx99@gmail.com",
      "Unpaid Ticket Reminder",
      emailMessage
    );
  });

  console.log("Unpaid ticket reminders sent successfully.");
}

module.exports = sendUnpaidTicketReminders();
