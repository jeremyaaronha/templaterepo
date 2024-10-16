// Require the necessary utilities
const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const getAccountByEmail = require('../models/account-model') 



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  let nav = await utilities.getNav()
  let notice = req.flash('notice') || '';  
  let errors = req.flash('errors') || [];  // Initialize errors from flash or set to empty array
  
  res.render("account/login", {
    title: "Login",
    nav,
    notice,
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
      return res.redirect("/account/login"); // Redirigir a login con mensaje flash

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


/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
   req.flash("notice", "Please check your credentials and try again.")
   res.status(400).render("account/login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
   })
  return
  }
  try {
   if (await bcrypt.compare(account_password, accountData.account_password)) {
   delete accountData.account_password
   const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 })
   if(process.env.NODE_ENV === 'development') {
     res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
     } else {
       res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
     }
   return res.redirect("/account/")
   }
  } catch (error) {
   return new Error('Access Forbidden')
  }
 }



async function renderAccountManagement(req, res) {
  try {
    let nav = await utilities.getNav();  
    const accountData = req.session.account || req.user;

    res.render('account/accountManagement', {
      title: 'Account Management',
      nav,
      account: accountData,
      notice: req.flash('notice') || '', 
      errors: req.flash('errors') || [],  
    });
  } catch (error) {
    console.error('Error rendering account management:', error);
    res.status(500).render('account/accountManagement', {
      title: 'Account Management',
      nav,
      account: null,
      notice: null,
      errors: [{ msg: 'There was an issue loading the account management page.' }],
    });
  }
}
  
module.exports = { buildLogin, buildRegister, registerAccount, processLogin, accountLogin, renderAccountManagement }
  

