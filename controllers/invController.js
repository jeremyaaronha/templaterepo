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
  const classificationSelect = await utilities.buildClassificationList()


  let notice = req.flash("notice"); // Recoge el mensaje flash

  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    classificationSelect,
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


/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}


/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  try {
    const inv_id = parseInt(req.params.inv_id);
    let nav = await utilities.getNav();
    const itemData = await invModel.getInventoryById(inv_id);
    const classificationSelect = await utilities.buildClassificationList(itemData.classification_id);
    const itemName = `${itemData.inv_make} ${itemData.inv_model}`;
    
    res.render("./inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationSelect: classificationSelect,
      errors: null,
      inv_id: itemData.inv_id,
      inv_make: itemData.inv_make,
      inv_model: itemData.inv_model,
      inv_year: itemData.inv_year,
      inv_description: itemData.inv_description,
      inv_image: itemData.inv_image,
      inv_thumbnail: itemData.inv_thumbnail,
      inv_price: itemData.inv_price,
      inv_miles: itemData.inv_miles,
      inv_color: itemData.inv_color,
      classification_id: itemData.classification_id
    });
  } catch (error) {
    next(error);
  }
}


/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body
  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/management")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

module.exports = invCont
