require('dotenv').config()
const jwt = require('jsonwebtoken');

const isSensor = (req, res, next) => {
    const authHeader = req.headers['authorization'];
  
    const token = authHeader.split(' ')[1];
  
    try {
      const decoded = jwt.verify(token, process.env.SECRET_KEY);
      req.user = decoded;
      const role = decoded.role;
      if (role === 'Teacher' || role ==='Sensor') {
        next();
      } else {
        return res.status(401).json({ message: 'Unauthorized: User.' })
      }
      
    } catch (err) {
      console.error('JWT Verification Error:', err);
      res.status(401).json({ message: 'Unauthorized: Invalid token.' });
    }
  };

module.exports = isSensor;