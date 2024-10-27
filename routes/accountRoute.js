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


router.get("/update/:account_id", utilities.handleErrors(accountController.buildUpdateAccountView));

router.post("/update", 
  validate.updateAccountRules(),  
  validate.checkUpdateAccountData, 
  utilities.handleErrors(accountController.updateAccount) 
);

// Ruta para cambiar la contraseña
router.post('/change-password', utilities.handleErrors(accountController.updatePassword));

// Ruta para el logout
router.get("/logout", accountController.logout);

router.get("/admin", utilities.checkLogin, utilities.handleErrors(accountController.getAccountAdmin));


module.exports = router;
