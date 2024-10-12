// Needed Resources 
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const baseController = require("../controllers/baseController")
const validate = require("../utilities/account-validation");



// rutas del inventario
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))

router.get('/error500', baseController.triggerError);

router.get("/management", utilities.handleErrors(invController.buildManagementView))


// Route to display add-classification form
router.get("/add-classification", utilities.handleErrors(invController.buildAddClassification));

// Route to process classification form submission with validation
router.post("/add-classification", 
  validate.classificationRules(), 
  validate.checkClassificationData, 
  utilities.handleErrors(invController.addClassification) 
);

module.exports = router
