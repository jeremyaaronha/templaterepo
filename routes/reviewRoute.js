const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const utilities = require('../utilities');
const validate = require('../utilities/review-validation');

router.post(
    '/add',
    validate.reviewRules(),
    validate.checkReviewData,
    utilities.checkLogin,
    utilities.checkJWTToken,
    utilities.handleErrors(reviewController.addReview)
  );
router.get('/inventory/:inventoryId', utilities.handleErrors(reviewController.getReviewsByInventoryId));


router.get('/edit/:reviewId', utilities.checkLogin, utilities.handleErrors(reviewController.editReviewView));

router.post('/edit/:reviewId', utilities.checkLogin, utilities.handleErrors(reviewController.updateReview));

router.post('/delete', utilities.checkLogin, utilities.handleErrors(reviewController.deleteReview));



module.exports = router;
