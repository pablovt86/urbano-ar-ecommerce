const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/userController');
const Admin = require('../middlewares/authMiddleware');

// Solo el admin debería poder ver o borrar usuarios
router.get('/', Admin, usuarioController.listar);
router.get('/:id', Admin, usuarioController.obtenerUno);
router.delete('/:id', Admin, usuarioController.eliminar);

module.exports = router;
