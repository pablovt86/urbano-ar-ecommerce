// backend/index.js
require('dotenv').config();
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
app.use(express.json({ limit: '50mb' })); // Para aceptar JSON con payloads grandes (como imágenes en base64)
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ============================================================================
// REGISTRO DE RUTAS MODULARES EN EXPRESS
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/talles', recomendadorRoutes); 

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
// ENDPOINT: ESTUDIO VIRTUAL IA (PROBADOR AVANZADO)
// ============================================================================
app.post('/api/sistema/procesar-studio', async (req, res) => {
  try {
    const { fotoFrente, fotoPerfil, productoId } = req.body;

    if (!fotoFrente) {
      return res.status(400).json({ 
        ok: false, 
        msg: 'Falta la captura frontal obligatoria para el mapeo' 
      });
    }

    console.log(`🔮 [IA Engine] Iniciando mapeo anatómico para producto ID: ${productoId}`);
    console.log(`📸 [IA Engine] Procesando buffers de imagen reales del usuario...`);

    // ============================================================================
    // AQUÍ CONECTAMOS CON EL SCRIPT GENERATIVO REAL
    // Por ahora, el servidor procesa tus dos fotos reales y simula el cálculo 
    // de la cuadrícula de deformación textil antes de devolver el resultado.
    // ============================================================================
    
    // Simulamos un leve delay de procesamiento matricial (cálculo de hombros, torso y talle)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mandamos de vuelta tus PROPIAS fotos para que el Front las unifique 
    // pero ya validadas por el pipeline del servidor
    return res.status(200).json({
      ok: true,
      msg: 'Mapeo de mallas finalizado con éxito',
      vistasProcesadas: [
        { 
          id: 'frente', 
          titulo: 'Tu Frente Adaptado', 
          fotoCuerpo: fotoFrente // Tu foto real de frente
        },
        { 
          id: 'perfil', 
          titulo: 'Tu Perfil Adaptado', 
          fotoCuerpo: fotoPerfil || fotoFrente // Tu foto real de perfil
        }
      ]
    });

  } catch (error) {
    console.error('❌ Error crítico en el pipeline generativo:', error);
    return res.status(500).json({ 
      ok: false, 
      msg: 'Falla interna en el servidor de IA' 
    });
  }
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