const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoryController');




router.get('/', categoriaController.listar);
router.post('/', categoriaController.crear); // El que ya tenías
router.put('/:id', categoriaController.actualizar);
router.delete('/:id', categoriaController.eliminar);

module.exports = router;
