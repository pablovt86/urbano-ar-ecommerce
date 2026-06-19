const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');

// Agregar algo al carrito
router.post('/agregar', carritoController.agregarItem);

// Ver mi carrito (puedes usar el ID del usuario o sacarlo del Token JWT)
router.get('/:usuario_id', carritoController.verCarrito);
// Finalizar la compra (Restar stock y cerrar carrito)
router.post('/checkout', carritoController.finalizarCompra);


module.exports = router;
