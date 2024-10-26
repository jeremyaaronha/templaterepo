// Require the necessary utilities
const utilities = require("../utilities/index")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const getAccountByEmail = require('../models/account-model') 
const reviewModel = require('../models/review-model');



/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
  const token = req.cookies.jwt;  // revisa si hay un token de sesión

  // si ya está autenticado, redirigir al inicio o a su cuenta
  if (token) {
    const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    return res.redirect("/account");
  }

  let nav = await utilities.getNav()
  let notice = req.flash('notice') || '';  
  let errors = req.flash('errors') || [];  // Initialize errors from flash or set to empty array
  
  res.render("account/login", {
    title: "Login",
    nav,
    notice,
    errors,  // Send errors to the view
  })
}

async function buildRegister(req, res, next) {
    let nav = await utilities.getNav()
    req.flash("notice", "All fields are required") 

    res.render("account/register", {
      title: "Register",
      nav,
      errors: null,
    })
  }


/* ****************************************
*  Process Registration
* *************************************** */
async function registerAccount(req, res) {
    let nav = await utilities.getNav()
    const { account_firstname, account_lastname, account_email, account_password } = req.body
  
    // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }

    const regResult = await accountModel.registerAccount(
      account_firstname,
      account_lastname,
      account_email,
      hashedPassword
    )
    console.log("Attempting to register with:", account_firstname, account_lastname, account_email);

  
    if (regResult) {
      req.flash(
        "notice",
        `Congratulations, you\'re registered ${account_firstname}. Please log in.`
      )
      return res.redirect("/account/login"); // Redirigir a login con mensaje flash

    } else {
      req.flash("notice", "Sorry, the registration failed.")
      res.status(501).render("account/register", {
        title: "Registration",
        nav,
      })
    }
  }

  async function processLogin(req, res, next) {
    let nav = await utilities.getNav()
    const { account_email, account_password } = req.body
    
    // After performing validation, handle errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash('errors', errors.array());  // Store validation errors in flash
      return res.redirect('/account/login');  // Redirect back to the login form
    }
  
  // Si la autenticación es exitosa:
  res.status(200).render("account/dashboard", {
    title: "Dashboard",
    nav,
    account_email,
  })
}


async function accountLogin(req, res) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;
  const accountData = await accountModel.getAccountByEmail(account_email);
  
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
      
      // Store JWT in a secure cookie
      const cookieOptions = process.env.NODE_ENV === 'development' ? 
        { httpOnly: true, maxAge: 3600 * 1000 } : 
        { httpOnly: true, secure: true, maxAge: 3600 * 1000 };
      
      res.cookie("jwt", accessToken, cookieOptions);
      req.session.user = accountData;  // Guarda el usuario en la sesión
      return res.redirect("/account/");
    } else {
      req.flash("notice", "Incorrect password. Please try again.");
      return res.redirect("/account/login");
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).send("An error occurred during login.");
  }
}




 async function renderAccountManagement(req, res) {
  try {
    let nav = await utilities.getNav();

    // Retrieve the account data from JWT or session
    const token = req.cookies.jwt; // Retrieve JWT from cookies
    let accountData;

    if (token) {
      accountData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } else {
      accountData = req.session.account || req.user; // Fall back to session-based authentication
    }

    if (!accountData) {
      req.flash("notice", "You need to be logged in to view this page.");
      return res.redirect("/account/login");
    }

    res.render('account/accountManagement', {
      title: 'Account Management',
      nav,
      account: accountData,
      notice: req.flash('notice') || '', 
      errors: req.flash('errors') || [],
    });
  } catch (error) {
    console.error('Error rendering account management:', error);
    res.status(500).render('account/accountManagement', {
      title: 'Account Management',
      nav,
      account: null,
      notice: null,
      errors: [{ msg: 'There was an issue loading the account management page.' }],
    });
  }
}


  

/* ***************************
 * Build the account update view
 * ************************** */
async function buildUpdateAccountView (req, res, next) {
  const account_id = parseInt(req.params.account_id);
  let nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(account_id); // Assuming this function exists
  
  res.render("account/update-account", {
    title: "Update Account Information",
    nav,
    accountData, // Send current account data to the view
    errors: null
  });
};

/* ***************************
 * Process account update
 * ************************** */
// async function updateAccount(req, res, next) {
//   const {
//     account_id,
//     account_firstname,
//     account_lastname,
//     account_email
//   } = req.body;

//   let nav = await utilities.getNav();
//   const updateResult = await accountModel.updateAccount(
//     account_id, account_firstname, account_lastname, account_email
//   ); 

//   if (updateResult) {
//     // Generar nuevo token JWT con la información actualizada
//     const updatedAccount = {
//       account_id,
//       account_firstname,
//       account_lastname,
//       account_email,
//       account_type: updateResult.account_type 
//     };
//     const newToken = jwt.sign(updatedAccount, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

//     // Actualizar la cookie con el nuevo token
//     res.cookie("jwt", newToken, { httpOnly: true, maxAge: 3600 * 1000 });

//     req.flash("notice", "Account updated successfully.");
//     res.redirect("/account");
//   } else {
//     req.flash("notice", "Sorry, the update failed.");
//     res.status(501).render("account/update-account", {
//       title: "Update Account Information",
//       nav,
//       accountData: req.body, 
//       errors: null
//     });
//   }
// };
async function updateAccount(req, res, next) {
  const {
    account_id,
    account_firstname,
    account_lastname,
    account_email,
  } = req.body;

  let nav = await utilities.getNav();

  try {
    // Verifica si el correo ya existe en la base de datos
    const existingEmail = await accountModel.checkExistingEmail(account_email);

    // Si el correo existe y pertenece a otro usuario (diferente ID), muestra un error
    if (existingEmail && existingEmail.account_id !== parseInt(account_id)) {
      req.flash("notice", "The email is already in use. Please try another email.");
      return res.status(400).render("account/update-account", {
        title: "Update Account Information",
        nav,
        accountData: req.body,
        errors: [{ msg: "Email already exists" }],
      });
    }

    // Procede a actualizar la cuenta si el correo es válido
    const updateResult = await accountModel.updateAccount(
      account_id,
      account_firstname,
      account_lastname,
      account_email
    );

    if (updateResult) {
      // Actualización exitosa, generar un nuevo token JWT para reflejar los nuevos datos
      const accountData = await accountModel.getAccountById(account_id);
      delete accountData.account_password; // Elimina la contraseña antes de generar el token

      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1h",
      });

      // Almacena el nuevo JWT en una cookie segura
      const cookieOptions =
        process.env.NODE_ENV === "development"
          ? { httpOnly: true, maxAge: 3600 * 1000 }
          : { httpOnly: true, secure: true, maxAge: 3600 * 1000 };

      res.cookie("jwt", accessToken, cookieOptions);

      // Enviar mensaje de éxito y redirigir al management
      req.flash("notice", "Account updated successfully.");
      return res.redirect("/account");
    } else {
      // Actualización fallida, renderiza el formulario de nuevo con un mensaje de error
      req.flash("notice", "Sorry, the update failed.");
      return res.status(501).render("account/update-account", {
        title: "Update Account Information",
        nav,
        accountData: req.body, // Mostrar los datos del formulario si falla la actualización
        errors: null,
      });
    }
  } catch (error) {
    console.error("Error updating account:", error);
    req.flash("notice", "There was an error updating your account. Please try again.");
    return res.status(500).render("account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: req.body,
      errors: [{ msg: "Error updating account" }],
    });
  }
}



function authenticateJWT(req, res, next) {
  const token = req.cookies.jwt;

  if (!token) {
    req.flash("notice", "You need to log in to view this page.");
    return res.redirect("/account/login");
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, accountData) => {
    if (err) {
      req.flash("notice", "Invalid token. Please log in again.");
      return res.redirect("/account/login");
    }

    // Store accountData in res.locals or req.user for use in views
    res.locals.account = accountData;
    next();
  });
}

/* ***************************
 *  Process password update
 * ************************** */
async function updatePassword(req, res, next) {
  const { account_id, new_password } = req.body;
  
  let nav = await utilities.getNav();

  // Hash the new password before storing it
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hashSync(new_password, 10);
  } catch (error) {
    req.flash("notice", "Sorry, there was an error processing the password update.");
    return res.status(500).render("account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: await accountModel.getAccountById(account_id), 
      errors: null,
    });
  }

  const updateResult = await accountModel.updateAccountPassword(account_id, hashedPassword);
  if (updateResult) {
    req.flash("notice", "Password updated successfully.");
    res.redirect("/account");
  } else {
    req.flash("notice", "Sorry, the password update failed.");
    res.status(501).render("account/update-account", {
      title: "Update Account Information",
      nav,
      accountData: await accountModel.getAccountById(account_id), 
      errors: null,
    });
  }
}

/* ***************************
 *  Update account password
 * ************************** */
async function updateAccountPassword(account_id, hashedPassword) {
  try {
    const sql = 'UPDATE account SET account_password = $1 WHERE account_id = $2 RETURNING *';
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rowCount; // Devuelve el número de filas afectadas
  } catch (error) {
    console.error("Error updating password:", error);
    return null;
  }
}

// Logout function in accountController.js
async function logout(req, res) {
  try {
    // Limpiar la cookie que contiene el JWT
    res.clearCookie("jwt");
    res.clearCookie("sessionId");


    req.flash("notice", "You have successfully logged out.");
    return res.redirect("/account/login");
  } catch (error) {
    console.error("Error during logout:", error);
    res.status(500).send("An error occurred during logout.");
  }
}

async function checkAdminOrEmployee(req, res, next) {
  const token = req.cookies.jwt; // Verificar si hay un token JWT en las cookies

  // Si no hay token, redirigir al login
  if (!token) {
    req.flash("notice", "You need to log in to access this page.");
    return res.redirect("/account/login");
  }

  try {
    // Verificar el token y obtener los datos del usuario
    const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // si el usuario está logueado pero no tiene los permisos adecuados
    if (userData.account_type !== 'Admin' && userData.account_type !== 'Employee') {
      req.flash("notice", "You do not have permission to access this page.");
      return res.status(403).render("account/unauthorized", {
        title: "Access Denied",
        nav: await utilities.getNav(),  
        account: userData,  
      });
    }

    next();
  } catch (err) {
    // Si el token es inválido o expirado, redirigir al login
    req.flash("notice", "Invalid session. Please log in again.");
    return res.redirect("/account/login");
  }
}

// Fetch user's reviews
async function getUserReviews(req, res, next) {
  try {
    const accountId = res.locals.account.account_id;
    const reviews = await reviewModel.getReviewsByAccountId(accountId);
    res.render('account/admin', { reviews, nav });
  } catch (error) {
    req.flash('notice', 'Error fetching your reviews.');
    res.redirect('/account');
  }
}

module.exports = { buildLogin, buildRegister, registerAccount, processLogin, accountLogin, renderAccountManagement, buildUpdateAccountView, updateAccount, authenticateJWT, updatePassword, updateAccountPassword, logout, checkAdminOrEmployee, getUserReviews }
  

