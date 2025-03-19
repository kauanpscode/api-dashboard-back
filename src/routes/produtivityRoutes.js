const express = require('express');
const {
  calcularProdutividade,
} = require('../controllers/ProdutivityController');
const router = express.Router();

router.post('/produtividade', calcularProdutividade);

module.exports = router;
