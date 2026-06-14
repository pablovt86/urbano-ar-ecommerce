const express = require('express');
const router = express.Router();
const { procesarVestidorIA } = require('../controllers/sistemaControllers');
// Ruta para registrar nuevos usuarios (Admin o Clientes)
router.post('/procesar-vestidor-ia', procesarVestidorIA);


// Ruta para iniciar sesión y obtener el Token

module.exports = router;