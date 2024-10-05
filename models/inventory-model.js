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

module.exports = { getClassifications, getInventoryByClassificationId, getInventoryById }
