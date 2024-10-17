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

router.get("/add-inventory", utilities.handleErrors(invController.buildAddInventory));

// Route to process add-inventory form submission
router.post("/add-inventory", 
  validate.inventoryRules(),  //  reglas de validación
  validate.checkInventoryData,  // Middleware validar los datos
  utilities.handleErrors(invController.addInventory) // Controlador maneja la lógica
);

// Update Inventory Route
router.post("/update", 
  validate.inventoryRules(),  // Reglas de validación  para los actualizados
  validate.checkUpdateData,  // Middleware para manejar errores en la actualización
  utilities.handleErrors(invController.updateInventory) // Controlador para actualizar el inventario
);


router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON))

router.get("/edit/:inv_id", utilities.handleErrors(invController.editInventoryView));

router.post("/update", utilities.handleErrors(invController.updateInventory));


module.exports = router
