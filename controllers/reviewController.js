const reviewModel = require("../models/review-model");
const utilities = require("../utilities");
const { validationResult } = require('express-validator');

/* ***************************
 *  Add a new review
 * ************************** */
async function addReview(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("notice", "Validation failed. Please check your input.");
        return res.redirect(`/inv/detail/${req.body.inv_id}`);
    }

    const { review_text, inv_id } = req.body;
    const account_id = req.session.user.account_id;

    if (!review_text || review_text.trim().length < 2) {
        req.flash("notice", "Review must be at least 2 characters long.");
        return res.redirect(`/inv/detail/${inv_id}`);
    }

    try {
        const result = await reviewModel.addReview(review_text.trim(), inv_id, account_id);
        req.flash("notice", "Review added successfully!");
        res.redirect(`/inv/detail/${inv_id}`);
    } catch (error) {
        req.flash("notice", "An error occurred while adding the review. Please try again.");
        res.status(500).redirect(`/inv/detail/${inv_id}`);
    }
}


/* ***************************
 *  Get reviews by inventoryId
 * ************************** */
async function getReviews(req, res, next) {
    const inv_id = req.params.inventoryId;
    try {
        const reviews = await reviewModel.getReviewsByInventoryId(inv_id);
        res.locals.reviews = reviews;
        next();
    } catch (error) {
        req.flash("notice", "Error fetching reviews.");
        next();
    }
}

/* ***************************
 *  Delete a review
 * ************************** */
async function deleteReview(req, res, next) {
    const { review_id, inv_id } = req.body;
    const account_id = req.session.user.account_id;


    try {
        const result = await reviewModel.deleteReview(review_id, account_id);

        if (result) {
            req.flash('notice', 'Review successfully deleted.');
            res.redirect(`/inv/detail/${inv_id}`);
        } else {
            req.flash('notice', 'Unable to delete the review. Please try again.');
            res.redirect(`/inv/detail/${inv_id}`);
        }
    } catch (error) {
        req.flash('error', 'An error occurred while deleting the review.');
        res.status(500).redirect(`/inv/detail/${inv_id}`);
    }
}


/* ***************************
 *  Render edit review view
 * ************************** */
async function editReviewView(req, res, next) {
    const reviewId = req.params.reviewId;
    try {
        const review = await reviewModel.getReviewById(reviewId);
        if (review) {
            res.render('reviews/edit', { review, inv_id: review.inv_id, nav: await utilities.getNav(), title: "Edit Review" });
        } else {
            req.flash('notice', 'Review not found.');
            res.redirect(`/inv/detail/${req.query.inv_id}`);
        }
    } catch (error) {
        req.flash('notice', 'Error loading review.');
        res.redirect(`/inv/detail/${req.query.inv_id}`);
    }
}




/* ***************************
 *  Build Edit Review View
 * ************************** */
async function buildEditReview(req, res) {
    const { review_id } = req.params;
    const account_id = req.session.user.account_id;

    try {
        const review = await reviewModel.getReviewById(review_id, account_id);

        if (review) {
            res.render('reviews/edit-review', {
                title: 'Edit Review',
                review,
                errors: null,
            });
        } else {
            req.flash('notice', 'Review not found or permission denied.');
            res.redirect('/account');
        }
    } catch (error) {
        req.flash('notice', 'Error retrieving review.');
        res.redirect('/account');
    }
}

/* ***************************
 *  Update Review
 * ************************** */
async function updateReview(req, res) {
    const { review_id, review_text } = req.body;
    const inv_id = req.query.inv_id; 
    const account_id = req.session.user.account_id;
    

    try {
        const updatedReview = await reviewModel.updateReview(review_id, review_text, account_id);
        if (updatedReview) {
            req.flash('notice', 'Review updated successfully.');
            res.redirect(`/inv/detail/${req.body.inv_id}`);
        } else {
            req.flash('notice', 'Unable to update the review.');
            res.redirect(`/inv/detail/${req.body.inv_id}`);
        }
    } catch (error) {
        req.flash('notice', 'Error updating the review.');
        res.redirect(`/inv/detail/${req.body.inv_id}`);
    }
}


module.exports = {
    addReview,
    getReviews,
    editReviewView,
    deleteReview,
    buildEditReview,
    updateReview
};
