// Needed Resources 
const express = require("express")
const router = new express.Router() // using separate router files for specific elements of the application would keep the server.js file smaller and more manageable 
const invController = require("../controllers/invController") // brings the inventory controller into this router document's scope to be used.

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);

module.exports = router; // exports the router object for use elsewhere.

