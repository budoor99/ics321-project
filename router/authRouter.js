const express = require("express");
const bcrypt = require("bcrypt");
const { body, validationResult } = require("express-validator");

const router = express.Router();
const db = require("../models/database.js"); // our database

router.post(
  "/signup",
  body("email", "Invalid email!")
    .trim()
    .escape()
    .isEmail()
    .isLength({ min: 3 }),
  body("username", "Invalid username/password!")
    .trim()
    .escape()
    .isLength({ min: 3 }),
  body("password", "Invalid username/password!")
    .trim()
    .escape()
    .isLength({ min: 8 }),
  body("firstName", "Invalid first name!").trim().escape().isLength({ min: 1 }),
  body("lastName", "Invalid last name!").trim().escape().isLength({ min: 1 }),
  body("id", "Invalid ID!").trim().escape().isLength({ min: 1 }),
  body("document", "Invalid document!").trim().escape().isLength({ min: 1 }),
  async (req, res) => {
    bodyErrors = validationResult(req);
    console.log("in the sign");

    if (!bodyErrors.isEmpty()) {
      console.log(bodyErrors);
      res.render("login", {
        errors: bodyErrors.array(),
      });
      return;
    }
    try {
      const { username, email, password } = req.body;
      let generalErrors = [];
      if (password !== req.body.confirm_password) {
        generalErrors.push("Password fields do not match, pleasy try again!");
        res.render("login", { errors: generalErrors });
        return;
      }
      const matchEmail = await db.emailExists(email);
      if (matchEmail) {
        generalErrors.push("Email has already been taken, please try again!");
        res.render("login", { errors: generalErrors });
        return;
      }
      const matchUsername = await db.usernameExists(username);
      if (matchUsername) {
        generalErrors.push(
          "Username has already been taken, please try again!",
        );
        res.render("login", { errors: generalErrors });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      req.body.password = hashedPassword;
      await db.addPassenger(req.body);
      return res.render("login", {
        message: "Account has been created successfully!",
      });
    } catch (ex) {
      console.log(ex);
      res.render("login", { error: "Sorry, Internal Server Error!" });
    }
  },
);

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    try {
      // Check if user exists
      const user = await db.usernameExists(username);
      const u = await db.getUserData(username);
      if (!user) {
        return res.render("login", {
          errors: ["Account doesn't exist, you may create a new one!"],
        });
      }
      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.Password);
      if (!isPasswordValid) {
        return res.render("login", {
          errors: ["Wrong password!"],
        });
      }

      // Regenerate session
      req.session.regenerate(() => {
        req.session.username = username;
        req.session.role = db.getRole(username);
        req.session.user = u;
        res.redirect("/");
      });
    } catch (error) {
      console.log(error);
      res.render("login", {
        errors: ["Internal server error. Please try again later."],
      });
    }
  },
);

module.exports = router;
