const jwt = require('jsonwebtoken');

function checkAuth(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) {
    return next(); 
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.user = decoded; 
  } catch (error) {
    console.error("JWT verification failed:", error);
  }
  next();
}

module.exports = checkAuth;
