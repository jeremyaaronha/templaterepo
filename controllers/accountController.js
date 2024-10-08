// Require the necessary utilities
const utilities = require("../utilities/index")

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
    req.flash("notice", "Your session has expired. Please log in again.") 

  res.render("account/login", {
    title: "Login",
    nav,
  })
}

module.exports = { buildLogin }
