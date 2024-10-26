const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const utilities = require('../utilities');
const validate = require('../utilities/review-validation');

// Route to add a new review (POST)
router.post(
    '/add',
    validate.reviewRules(),
    validate.checkReviewData,
    utilities.checkLogin,
    utilities.checkJWTToken,
    utilities.handleErrors(reviewController.addReview)
  );
// Middleware to fetch reviews when viewing vehicle details (GET)
router.get('/inventory/:inventoryId', utilities.handleErrors(reviewController.getReviewsByInventoryId));


// Ruta para editar un comentario
router.get('/edit/:reviewId', utilities.checkLogin, utilities.handleErrors(reviewController.editReviewView));

// Ruta para procesar la actualización del comentario
router.post('/edit/:reviewId', utilities.checkLogin, utilities.handleErrors(reviewController.updateReview));

// Ruta para eliminar un comentario
router.post('/delete', utilities.checkLogin, utilities.handleErrors(reviewController.deleteReview));



module.exports = router;
