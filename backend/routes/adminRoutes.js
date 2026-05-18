const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockController');
const adminController = require('../controllers/adminController');
const Admin = require('../middlewares/authMiddleware');

// Ruta: GET /api/admin/bajo-stock
router.get('/bajo-stock', stockController.reporteBajoStock);
router.get('/ventas', Admin, adminController.historialVentas);


module.exports = router;
