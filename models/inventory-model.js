const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    throw new Error("Error fetching inventory by classification ID")
  }
}

/* ***************************
 *  Get a specific vehicle by inventory_id
 * ************************** */
async function getInventoryById(inventoryId) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.inv_id = $1`,
      [inventoryId]
    )
    return data.rows[0] // Return only the first row since it's a single vehicle
  } catch (error) {
    throw new Error("Error fetching inventory by ID")
    
  }
}

/* *****************************
*   Add New Classification
* *************************** */
async function addNewClassification(classification_name){
  try {
    const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
    const result = await pool.query(sql, [classification_name])
    
    if (result.rowCount) {
      console.log("New classification added:", result.rows[0])
      return result.rows[0] // return the inserted row
    } else {
      throw new Error("Insertion failed, no row added.")
    }

    

  } catch (error) {
    console.error("Database Error:", error)
    throw new Error("Error adding new classification: " + error.message)
  }
}


/* *****************************
*   Add New Inventory Item
* *************************** */
async function addNewInventory(
  inv_make, inv_model, inv_year, inv_description,
  inv_image, inv_thumbnail, inv_price, inv_miles,
  inv_color, classification_id
) {
  try {
    const sql = `
      INSERT INTO inventory (inv_make, inv_model, inv_year, inv_description,
                             inv_image, inv_thumbnail, inv_price, inv_miles,
                             inv_color, classification_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
    const result = await pool.query(sql, [
      inv_make, inv_model, inv_year, inv_description,
      inv_image, inv_thumbnail, inv_price, inv_miles,
      inv_color, classification_id
    ]);
    return result.rows[0]; // Return the inserted row if successful
  } catch (error) {
    throw new Error("Error adding new inventory: " + error.message);
  }
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
async function updateInventory(
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
) {
  try {
    const sql =
      "UPDATE public.inventory SET inv_make = $1, inv_model = $2, inv_description = $3, inv_image = $4, inv_thumbnail = $5, inv_price = $6, inv_year = $7, inv_miles = $8, inv_color = $9, classification_id = $10 WHERE inv_id = $11 RETURNING *"
    const data = await pool.query(sql, [
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
      inv_id
    ])
    return data.rows[0]
  } catch (error) {
    console.error("model error: " + error)
  }
}



module.exports = { getClassifications, getInventoryByClassificationId, getInventoryById, addNewClassification, addNewInventory, updateInventory }
