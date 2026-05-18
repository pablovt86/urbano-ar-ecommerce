const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productController');
const Admin = require('../middlewares/authMiddleware');

router.post('/', Admin, productoController.crearProducto); // El que ya tenías
router.get('/', productoController.obtenerTodos);
router.get('/:id', productoController.obtenerUno);
router.put('/:id', Admin, productoController.actualizar);
router.delete('/:id', Admin, productoController.eliminar);
router.patch('/variantes/:id/stock', Admin, productoController.actualizarStockVariante);

module.exports = router;
