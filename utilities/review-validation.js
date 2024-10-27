const { body, validationResult } = require('express-validator');

const reviewRules = () => {
  return [
    body('review_text')
      .trim()
      .isLength({ min: 3 })
      .withMessage('Review must be at least 3 characters long.'),
  ];
};

const checkReviewData = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('notice', errors.array().map(error => error.msg).join(', '));
    return res.redirect(`/inv/detail/${req.body.inv_id}`);
  }
  next();
};

module.exports = { reviewRules, checkReviewData };
