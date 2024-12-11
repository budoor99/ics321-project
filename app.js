const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const cron = require("node-cron");
const app = express();
const PORT = 3000;
const { sendUnpaidTicketReminders } = require("./services/email");

// Set EJS as the template engine
app.set("view engine", "ejs");
app.set("views", "views");

// Serve static files (CSS, JS, images, etc.)
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// using some built-up middleware for parsing the req.body
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: "NotYourSecret$#@!",
  }),
);

// cron.schedule("0 10 * * *", () => {
//   console.log("Running scheduled task to send email reminders...");
//   sendUnpaidTicketReminders();
// });

// Routes
const mainRouter = require("./router/main");
const AuthRouter = require("./router/authRouter");

// // Login route (POST)
// app.post('/login', (req, res) => {
//   // Handle login logic here
//   res.send('Login functionality not implemented yet.');
// });

// // Signup route (POST)
// app.post('/signup', (req, res) => {
//   // Handle signup logic here
//   res.send('Signup functionality not implemented yet.');
// });

// // Forgot password route
// app.get('/forgot-password', (req, res) => {
//   res.send('Forgot password functionality not implemented yet.');
// });
app.use(AuthRouter);
app.use(mainRouter);
// in case 404 reached
app.use((req, res) => {
  res.status(404).render("404.ejs");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
