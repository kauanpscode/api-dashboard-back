const express = require('express');
const authController = require('../controllers/AuthController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'Rota protegida acessada com sucesso' });
});

module.exports = router;
