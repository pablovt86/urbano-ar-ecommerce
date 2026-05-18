// routes/recomendadorRoutes.js
const express = require('express');
const router = express.Router();
const recomendarTalle  = require('../controllers/recomendadorController');

router.post('/recomendar', recomendarTalle);
router.get('test', (req, res) => {
  res.json({ success: true, message: "Ruta de recomendación de talles funcionando correctamente." });
});

module.exports = router;