// backend/index.js
require('dotenv').config(); // <-- ESTO TIENE QUE SER LA LÍNEA 1 ABSOLUTA
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); 
const app = express();
const PORT = process.env.PORT || 3000;
const path = require('path');
const { exec } = require('child_process');

// Importar rutas modulares
const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productsRoutes');
const categoriaRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRouter');
const carritoRoutes = require('./routes/carritoRoutes');
const recomendadorRoutes = require('./routes/recomendadorRoutes');

// Middlewares globales de configuración (Arriba de todo)
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// REGISTRO DE RUTAS MODULARES EN EXPRESS
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/talles', recomendadorRoutes); // Sincronizado con router.post('/recomendar')

// ============================================================================
// ENDPOINT INTEGRADO: SISTEMA AR PROBADOR VIRTUAL AUTÓNOMO
// ============================================================================
app.post('/api/sistema/abrir-probador', (req, res) => {
    const altura = req.body.altura || 1.70;
    const peso = req.body.peso || 70;
    const imagenUrl = req.body.imagen || 'remera.png'; 
    
    const scriptPath = path.join(__dirname, '..', 'provador', 'probador_urbano.py');
    const carpetaProvador = path.join(__dirname, '..', 'provador');

    res.json({ success: true, message: "Levantando proceso AR con imagen dinámica" });

    exec(`python "${scriptPath}" ${altura} ${peso} "${imagenUrl}"`, { 
        cwd: carpetaProvador,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    }, (error) => {
        if (error) console.log("Proceso del probador virtual finalizado.");
    });
});

// ============================================================================
// LEVANTAMIENTO DE BASE DE DATOS Y SERVIDOR
// ============================================================================
sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Base de datos sincronizada. Tablas listas.');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error('❌ Error de DB:', err));