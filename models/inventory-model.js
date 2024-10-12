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


module.exports = { getClassifications, getInventoryByClassificationId, getInventoryById, addNewClassification }
