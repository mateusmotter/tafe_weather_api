require('dotenv').config()
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    console.log('Headers:', req.headers);
    const authHeader = req.headers['authorization'];
  
    if (!authHeader) {
      console.log('Authorization header not found in the request.');
      return res.status(401).json({ message: 'Unauthorized: Missing token.' });
    }
  
    const token = authHeader.split(' ')[1];
  
    if (!token) {
      console.log('Token not found in the Authorization header.');
      return res.status(401).json({ message: 'Unauthorized: Missing token.' });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
      console.log(decoded.role);
      next();
    } catch (err) {
      console.error('JWT Verification Error:', err);
      res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
  };

  module.exports = verifyToken;