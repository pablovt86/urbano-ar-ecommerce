// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
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

// Middlewares globales de configuración
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
app.post('/api/sistema/abrir-probador', async (req, res) => {
    const altura = req.body.altura || 1.70;
    const peso = req.body.peso || 70;
    const imagenUrl = req.body.imagen || 'remera.png';

    console.log(`📩 Backend - abrir-probador - Recibido: H=${altura}, W=${peso}, Imagen="${imagenUrl}"`);

    const probadorUrl = process.env.PROBADOR_URL;

    if (probadorUrl) {
        try {
            console.log(`🌐 Enviando configuración al probador Docker: ${probadorUrl}/configurar`);
            await axios.post(`${probadorUrl}/configurar`, {
                altura,
                peso,
                imagen: imagenUrl
            }, { timeout: 3000 });

            return res.json({ success: true, message: "Levantando proceso AR en contenedor", docker: true });
        } catch (error) {
            console.error("⚠️ Error comunicándose con el contenedor del probador, intentando fallback local:", error.message);
        }
    }

    // Fallback local:
    const scriptPath = path.join(__dirname, '..', 'probador', 'probador_urbano.py');
    const carpetaProbador = path.join(__dirname, '..', 'probador');

    res.json({ success: true, message: "Levantando proceso AR con imagen dinámica" });

    exec(`python "${scriptPath}" ${altura} ${peso} "${imagenUrl}"`, {
        cwd: carpetaProbador,
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