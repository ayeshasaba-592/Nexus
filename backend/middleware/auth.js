const jwt = require('jsonwebtoken');

const auth = function (req, res, next) {
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded.user ? decoded.user : decoded;
    next();
  } catch (err) {
    console.error("JWT Verification Error:", err.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// ROLE-BASED AUTHORIZATION: Checks if user has permission
auth.checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: 'Access denied: Unauthorized role' });
    }
    next();
  };
};

module.exports = auth;