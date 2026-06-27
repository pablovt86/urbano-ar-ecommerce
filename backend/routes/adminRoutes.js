const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Rutas de métricas y ventas
router.get('/ventas', adminController.historialVentas);

// Rutas del CRUD de Productos centralizado en Admin
router.get('/productos', adminController.obtenerTodosProductos);
router.get('/productos/:id', adminController.obtenerUnoProducto);
router.post('/productos', adminController.crearProducto);
router.put('/productos/:id', adminController.actualizarProducto);
router.delete('/productos/:id', adminController.eliminarProducto);

// Gestión rápida de inventario de variantes
router.put('/variantes/:id/stock', adminController.actualizarStockVariante);

module.exports = router;