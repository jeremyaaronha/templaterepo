// Needed Resources 
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require('../controllers/accountController');
const validate = require('../utilities/account-validation')



router.get('/login', utilities.handleErrors(accountController.buildLogin));
router.get("/register", utilities.handleErrors(accountController.buildRegister));

// Process the registration data
router.post(
    "/register",
    validate.registationRules(),
    validate.checkRegData,
    utilities.handleErrors(accountController.registerAccount)
  )

// Procesar el intento de inicio de sesion
router.post(
    "/login",
    validate.loginRules(), 
    validate.checkLoginData, 
    utilities.handleErrors(accountController.processLogin) 
)


module.exports = router;
