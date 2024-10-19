// utilities/authorization.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

/* ****************************************
 *  Check JWT and Role Middleware
 * *************************************** */
const checkAdminOrEmployee = (req, res, next) => {
  if (!req.cookies.jwt) {
    req.flash("notice", "You must log in to access this page.");
    return res.redirect("/account/login");
  }

  jwt.verify(req.cookies.jwt, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err || !(accountData.account_type === "Employee" || accountData.account_type === "Admin")) {
      req.flash("notice", "You do not have permission to access this page.");
      return res.redirect("/account/login");
    }

    next();
  });
};

module.exports = checkAdminOrEmployee;
