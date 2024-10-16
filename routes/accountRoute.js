// Needed Resources 
const express = require("express")
const router = express.Router()
const utilities = require("../utilities")
const accountController = require('../controllers/accountController');
const validate = require('../utilities/account-validation')
const invController = require('../controllers/invController')





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
    utilities.handleErrors(accountController.accountLogin) 
)

// Add Classification Route
router.get("/classification", utilities.handleErrors(invController.buildAddClassification))

// Process the new classification submission
router.post("/classification", 
  validate.classificationRules(),
  validate.checkClassificationData,
  utilities.handleErrors(invController.addClassification)
)

router.get('/', utilities.checkLogin, utilities.handleErrors(accountController.renderAccountManagement))


module.exports = router;
