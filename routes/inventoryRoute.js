// Needed Resources 
const express = require("express")
const router = express.Router()
const invController = require("../controllers/invController")
const utilities = require("../utilities")
const baseController = require("../controllers/baseController")
const validate = require("../utilities/account-validation");
const checkAdminOrEmployee = require("../utilities/authorization");

// Rutas de inventario para usuarios generales
router.get("/type/:classificationId", utilities.handleErrors(invController.buildByClassificationId))
router.get("/detail/:inventoryId", utilities.handleErrors(invController.buildByInventoryId))

// Ruta de error 500
router.get('/error500', baseController.triggerError);

// Rutas protegidas para empleados y administradores
router.get("/management", checkAdminOrEmployee, utilities.handleErrors(invController.buildManagementView));

// Route to display add-classification form
router.get("/add-classification", checkAdminOrEmployee, utilities.handleErrors(invController.buildAddClassification));

// Route to process classification form submission with validation
router.post("/add-classification", checkAdminOrEmployee, 
  validate.classificationRules(), 
  validate.checkClassificationData, 
  utilities.handleErrors(invController.addClassification)
);

// Rutas para agregar, actualizar y eliminar inventario
router.get("/add-inventory", checkAdminOrEmployee, utilities.handleErrors(invController.buildAddInventory));

// Route to process add-inventory form submission
router.post("/add-inventory", checkAdminOrEmployee, 
  validate.inventoryRules(),  
  validate.checkInventoryData,  
  utilities.handleErrors(invController.addInventory) 
);

// Update Inventory Route
router.post("/update", checkAdminOrEmployee, 
  validate.inventoryRules(),  
  validate.checkUpdateData,  
  utilities.handleErrors(invController.updateInventory) 
);

router.get("/delete/:inv_id", checkAdminOrEmployee, utilities.handleErrors(invController.buildDeleteConfirmationView));

router.post("/delete", checkAdminOrEmployee, utilities.handleErrors(invController.deleteInventory));

// Ruta para obtener datos de inventario para público
router.get("/getInventory/:classification_id", utilities.handleErrors(invController.getInventoryJSON));

// Ruta para editar inventario protegida para empleados/admin
router.get("/edit/:inv_id", checkAdminOrEmployee, utilities.handleErrors(invController.editInventoryView));

module.exports = router
