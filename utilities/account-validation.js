const utilities = require(".")
  const { body, validationResult } = require("express-validator")
  const validate = {}

const accountModel = require("../models/account-model")



/*  **********************************
  *  Registration Data Validation Rules
  * ********************************* */
validate.registationRules = () => {
    return [
      // firstname is required and must be string
      body("account_firstname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a first name."), 
  
      // lastname is required and must be string
      body("account_lastname")
        .trim()
        .escape()
        .notEmpty()
        .isLength({ min: 1 })
        .withMessage("Please provide a last name."), 
  
        // valid email is required and cannot already exist in the database
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail() // refer to validator.js docs
        .withMessage("A valid email is required.")
        .custom(async (account_email) => {
            const emailExists = await accountModel.checkExistingEmail(account_email)
            if (emailExists){
            throw new Error("Email exists. Please log in or use different email")
            }
        }),
  
      // password is required and must be strong password
      body("account_password")
        .trim()
        .notEmpty()
        .isStrongPassword({
          minLength: 12,
          minUppercase: 1,
          minNumbers: 1,
          minSymbols: 1,
        })
        .withMessage("Password does not meet requirements."),
    ]
  }

/* ******************************
 * Check data and return errors or continue to registration
 * ***************************** */
validate.checkRegData = async (req, res, next) => {
    const { account_firstname, account_lastname, account_email } = req.body
    let errors = []
    errors = validationResult(req)
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav()
      res.render("account/register", {
        errors,
        title: "Registration",
        nav,
        account_firstname,
        account_lastname,
        account_email,
      })
      return
    }
    next()
  }

/* **********************************
 *  Login Data Validation Rules
 * ********************************* */
validate.loginRules = () => {
    return [
      // Email is required and must be a valid email
      body("account_email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("A valid email is required."),
      // Password is required
      body("account_password")
        .trim()
        .notEmpty()
        .withMessage("Password is required."),
    ]
  }

  /* ******************************
 * Check login data and return errors or continue to login
 * ***************************** */
  validate.checkLoginData = async (req, res, next) => {
    let errors = validationResult(req);
    let nav = await utilities.getNav(); 
    if (!errors.isEmpty()) {
      req.flash("notice", "There were validation errors. Please check the form.");  
      res.render("account/login", {
        title: "Login",
        nav,
        errors: errors.array(),
        notice: req.flash('notice'), 
      });
      return;  
    }
    next(); 
  };
  

  

// Classification name validation rules
validate.classificationRules = () => {
    return [
      // classification_name must be alphanumeric with no spaces
      body("classification_name")
        .trim()
        .escape()
        .notEmpty()
        .matches(/^[A-Za-z]+$/)
        .withMessage("Classification name must contain only letters (no spaces or special characters)."),
    ];
  };
  
  // Check validation result
  validate.checkClassificationData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const nav = await utilities.getNav();
      const notice = req.flash('notice'); // Agregar el mensaje flash
      res.render("inventory/add-classification", {
        title: "Add New Classification",
        nav,
        errors: errors.array(),
        notice, // Pasar el mensaje flash a la vista
      });
      return;
    }
    next();
  };
  
  


// Inventory validation rules
validate.inventoryRules = () => {
    return [
      body("inv_make")
        .trim()
        .notEmpty()
        .withMessage("Make is required.")
        .matches(/^[A-Za-z0-9\s]+$/)
        .withMessage("Make must contain only letters."),
        
      body("inv_model")
        .trim()
        .notEmpty()
        .withMessage("Model is required.")
        .matches(/^[A-Za-z0-9\s]+$/)
        .withMessage("Model can contain only letters and numbers."),
        
      body("inv_year")
        .trim()
        .isNumeric()
        .withMessage("Year must be numeric.")
        .isInt({ min: 1886, max: new Date().getFullYear() })
        .withMessage("Enter a valid year."),
        
      body("inv_price")
        .trim()
        .isDecimal()
        .withMessage("Price must be a valid decimal."),
        
      body("inv_miles")
        .trim()
        .isNumeric()
        .withMessage("Mileage must be numeric.")
        .isInt({ min: 0 })
        .withMessage("Mileage must be a positive number."),
        
      body("inv_color")
        .trim()
        .notEmpty()
        .withMessage("Color is required.")
        .matches(/^[A-Za-z]+$/)
        .withMessage("Color must contain only letters."),
        
      body("classification_id")
        .notEmpty()
        .withMessage("Classification is required."),
    ];
};

  
  // Check Inventory Data Validation
  validate.checkInventoryData = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      let nav = await utilities.getNav();  
      let classificationList = await utilities.buildClassificationList(req.body.classification_id);
      return res.status(400).render("inventory/add-inventory", {
        title: "Add New Inventory",
        nav,
        classificationList,
        errors: errors.array(),
        ...req.body,
      });
    }
    next();
  };


    // Errors will be redirected back to edit view
    validate.checkUpdateData = async (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          let nav = await utilities.getNav();  
          let classificationList = await utilities.buildClassificationList(req.body.classification_id);

          return res.status(400).render("inventory/edit-inventory", {
            title: "Edit " + req.body.inv_make + " " + req.body.inv_model,
            nav,
            classificationList,
            errors: errors.array(),
            inv_id: req.body.inv_id,
            ...req.body,
          });
        }
        next();
      };
  
  

  
  module.exports = validate
  