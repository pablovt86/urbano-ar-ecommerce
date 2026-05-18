const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Ruta para registrar nuevos usuarios (Admin o Clientes)
router.post('/registro', authController.registro);

// Ruta para iniciar sesión y obtener el Token
router.post('/login', authController.login);

module.exports = router;
