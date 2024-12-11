const isLoggedIn = (req, res, next) => {
  // check if session exist
  if (!req.session?.username) {
    return res.redirect("login");
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.session?.role === "employee") {
    next();
  } else {
    res.render("index", {
      auth: "You Are Not Authorized!",
    });
  }
};
const isCustomer = (req, res, next) => {
  if (req.session?.role === "customer") {
    next();
  } else {
    res.render("index", {
      auth: "You Are Not Authorized!",
    });
  }
};
module.exports = { isLoggedIn, isAdmin, isCustomer };
