const db = require('../database');
const { format } = require('date-fns');

/* ***************************
 *  Add a new review
 * ************************** */
exports.addReview = async (review_text, inv_id, account_id) => {
    const sql = `
        INSERT INTO reviews (review_text, inv_id, account_id)
        VALUES ($1, $2, $3) RETURNING *`;
    const values = [review_text, inv_id, account_id];
    try {
        const { rows } = await db.query(sql, values);
        return rows[0];
    } catch (error) {
        throw new Error('Failed to add review: ' + error.message);
    }
};

/* ***************************
 *  Get reviews by inventoryId
 * ************************** */
exports.getReviewsByInventoryId = async (inv_id) => {
    const sql = `
        SELECT r.review_id, r.review_text, a.account_firstname, a.account_lastname, r.review_date, r.account_id
        FROM reviews r 
        JOIN account a ON r.account_id = a.account_id 
        WHERE r.inv_id = $1 
        ORDER BY r.review_date DESC`;
    try {
        const { rows } = await db.query(sql, [inv_id]);
        
        return rows.map(review => {
            review.review_date = format(new Date(review.review_date), "HH:mm dd MMM yyyy");
            review.reviewer_name = `${review.account_firstname} ${review.account_lastname}`;
            return review;
        });
    } catch (error) {
        throw new Error('Failed to retrieve reviews: ' + error.message);
    }
};



// Get a single review by ID
exports.getReviewById = async (review_id) => {
    const sql = 'SELECT * FROM reviews WHERE review_id = $1';
    const values = [review_id];
  
    try {
        const { rows } = await db.query(sql, values);
        return rows[0];
    } catch (error) {
        throw new Error('Failed to retrieve review: ' + error.message);
    }
};

  
// Update a review in the database
exports.updateReview = async (review_id, review_text, account_id) => {
    const sql = 'UPDATE reviews SET review_text = $1 WHERE review_id = $2 AND account_id = $3 RETURNING *';
    const values = [review_text, review_id, account_id];
  
    try {
      const { rows } = await db.query(sql, values);
      return rows[0];
    } catch (error) {
      throw new Error('Failed to update review: ' + error.message);
    }
  };
  
  // Delete review
  exports.deleteReview = async (review_id, account_id) => {
    const sql = 'DELETE FROM reviews WHERE review_id = $1 AND account_id = $2 RETURNING *';
    const values = [review_id, account_id];
    
    try {
      const { rows } = await db.query(sql, values);
      return rows.length > 0;
    } catch (error) {
      throw new Error('Failed to delete review: ' + error.message);
    }
  };

  exports.getReviewsByAccountId = async (account_id) => {
    const sql = `
        SELECT r.review_id, r.review_text, r.review_date, i.inv_make, i.inv_model
        FROM reviews r
        JOIN inventory i ON r.inv_id = i.inv_id
        WHERE r.account_id = $1
        ORDER BY r.review_date DESC`;
    const values = [account_id];
  
    try {
      const { rows } = await db.query(sql, values);
      return rows;
    } catch (error) {
      throw new Error('Failed to retrieve reviews: ' + error.message);
    }
};

  
