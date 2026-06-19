const express = require('express');
const router = express.Router();
const { procesarVestidorIA, configurarProbador } = require('../controllers/sistemaControllers');

router.post('/configurar', configurarProbador);
router.post('/procesar-vestidor-ia', procesarVestidorIA);


// Ruta para iniciar sesión y obtener el Token

module.exports = router;