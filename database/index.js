const { Pool } = require("pg") /* imports the "Pool" functionality from the "pg" package. A pool is a collection of connection objects (10 is the default number) that allow multiple site visitors to be interacting with the database at any given time. This keeps you from having to create a separate connection for each interaction. */
require("dotenv").config() /* Imports the "dotenv" package which allows the sensitive information about the database location and connection credentials to be stored in a separate location and still be accessed. */
/* ***************
 * Connection Pool
 * SSL Object needed for local testing of app
 * But will cause problems in production environment
 * If - else will make determination which to use
 * *************** */
let pool
if (process.env.NODE_ENV == "development") {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL, // URL de la base de datos
    ssl: {
      rejectUnauthorized: false, // Ignora errores SSL para desarrollo
    },
  });
} else { // new code to try fix the render SSL requirement !!!
  pool = new Pool({
    connectionString: process.env.DATABASE_URL, // URL de la base de datos
    ssl: {
      rejectUnauthorized: false, // Agrega SSL para producción también
    },
  });
}

// Added for troubleshooting queries
// during development
module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text }) // Muestra la consulta que se ejecutó
      return res // Devuelve el resultado de la consulta
    } catch (error) {
      console.error("error in query", { text }) // Muestra el error si algo falla
      throw error // Lanza el error para que pueda manejarlo
    }
  },
}
