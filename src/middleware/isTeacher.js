require('dotenv').config()
const jwt = require('jsonwebtoken');

const isTeacher = (req, res, next) => {
    const authHeader = req.headers['authorization'];
  
    const token = authHeader.split(' ')[1];
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
      const role = decoded.role;
      if (role === 'Teacher') {
        next();
      } else {
        return res.status(401).json({ message: 'Unauthorized user' })
      }
      
    } catch (err) {
      console.error('JWT Verification Error:', err);
      res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
  };

module.exports = isTeacher;