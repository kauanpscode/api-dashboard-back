// src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const secret = 'secretKey';

const authMiddleware = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ message: 'Token não fornecido' });

  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token inválido' });
    req.userId = decoded.id;
    next();
  });
};
module.exports = authMiddleware;
