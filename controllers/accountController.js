// Require the necessary utilities
const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")


/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  
  let errors = req.flash('errors') || [];  // Initialize errors from flash or set to empty array
  
  res.render("account/login", {
    title: "Login",
    nav,
    errors,  // Send errors to the view
  })
}

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "All fields are required") 

    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }



/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
    console.log("Attempting to register with:", account_firstname, account_lastname, account_email);

  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      res.status(201).render("account/login", {
        title: "Login",
        nav,
      })
    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

  async function processLogin(req, res, next) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    
    // After performing validation, handle errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array());  // Store validation errors in flash
      return res.redirect('/account/login');  // Redirect back to the login form
    }
  
  // Si la autenticación es exitosa:
  res.status(200).render("account/dashboard", {
    title: "Dashboard",
    nav,
    account_email,
  })
}

  
module.exports = { buildLogin, buildRegister, registerAccount, processLogin }
  

