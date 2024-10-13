const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}


/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)

      // Si no se encuentra la clasificación, lanzar un error 404
      if (!data || data.length === 0) {
        return next({ status: 404, message: "Classification not found." });
      }

  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

/* ***************************
 *  Build inventory by inventoryId view
 * ************************** */
invCont.buildByInventoryId = async function (req, res, next) {
    const inventoryId = req.params.inventoryId;
    const vehicleData = await invModel.getInventoryById(inventoryId);
    const viewHTML = await utilities.buildVehicleDetail(vehicleData);
    let nav = await utilities.getNav(); 
    res.render("./inventory/detail", {
      title: `${vehicleData.inv_make} ${vehicleData.inv_model}`,
      nav, 
      viewHTML 
    });
}

/* ****************************************
*  Build Inventory Management View
* *************************************** */
invCont.buildManagementView = async function(req, res, next) {
  let nav = await utilities.getNav();
  let notice = req.flash("notice"); // Recoge el mensaje flash

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    errors: null,
    notice  // Pasa el mensaje a la vista
  });
};

/* ****************************************
 *  Deliver Add Classification View
 * *************************************** */
invCont.buildAddClassification = async function(req, res, next) {
  let nav = await utilities.getNav()
  let notice = req.flash('notice') || [];

  

  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    notice,  // Pass flash messages here
    errors: [],
  })
}

/* ****************************************
 *  Process Classification Submission
 * *************************************** */
invCont.addClassification = async function(req, res, next) {
  const { classification_name } = req.body;
  let nav = await utilities.getNav();

  
  try {
    const addResult = await invModel.addNewClassification(classification_name);

    if (addResult && addResult.classification_id) {
      req.flash("notice", `New classification ${classification_name} added successfully.`);
      res.status(201).redirect("/inv/management");
    } else {
      req.flash("notice", "Sorry, adding the new classification failed.");
      res.status(500).render("inventory/add-classification", {
        title: "Add Classification",
        nav,
        errors: [{ msg: "Failed to add classification" }],
        notice: req.flash("notice")
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred while adding the classification.");
    res.status(500).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: [{ msg: error.message }],
      notice: req.flash("notice")
    });
  }
};



/* ****************************************
 *  Build Add Inventory
 * *************************************** */

invCont.buildAddInventory = async function(req, res, next) {
  let nav = await utilities.getNav();
  let classificationList = await utilities.buildClassificationList();
  res.render("inventory/add-inventory", {
    title: "Add New Inventory",
    nav,
    classificationList,
    errors: null,
  });
};

/* ****************************************
 *  Process Add Inventory Submission
 * *************************************** */
invCont.addInventory = async function (req, res, next) {
  const {
    inv_make, inv_model, inv_year, inv_description,
    inv_image, inv_thumbnail, inv_price, inv_miles,
    inv_color, classification_id
  } = req.body;

  let nav = await utilities.getNav();
  
  try {
    const addResult = await invModel.addNewInventory(
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    );

    if (addResult) {
      req.flash("notice", "New vehicle added successfully.");
      res.status(201).redirect("/inv/management");
    } else {
      req.flash("notice", "Adding the vehicle failed.");
      res.status(500).render("inventory/add-inventory", {
        title: "Add Inventory",
        nav,
        errors: [{ msg: "Failed to add vehicle" }],
        notice: req.flash("notice")
      });
    }
  } catch (error) {
    req.flash("notice", "An error occurred while adding the vehicle.");
    res.status(500).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: [{ msg: error.message }],
      notice: req.flash("notice")
    });
  }
};


module.exports = invCont
