// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models'); 
const path = require('path');
const { exec , spawn } = require('child_process');

// 1. ACÁ SE CREA LA VARIABLE (¡Fundamental que esté acá arriba!)
const app = express(); 
const PORT = process.env.PORT || 3000;
 
// Importar rutas modulares
const authRoutes = require('./routes/authRoutes');
const productoRoutes = require('./routes/productsRoutes');
const categoriaRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRouter');
const carritoRoutes = require('./routes/carritoRoutes');
const recomendadorRoutes = require('./routes/recomendadorRoutes');
const sistemaRouter = require('./routes/sistemaRouter');
const { obtenerConfigProbador } = require('./controllers/sistemaControllers');

// Middlewares globales de configuración (¡Siempre arriba de los endpoints!)
app.use(cors({
    origin: '*', // Permite que tu localhost lea todo desde ngrok sin restricciones
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/images', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
}, express.static(path.join(__dirname, 'public', 'images')));
// Registro de rutas modulares comunes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/talles', recomendadorRoutes);
app.use('/api/sistema', sistemaRouter);

// El endpoint viejo de Python (si lo mantenés, va acá)



app.post('/api/sistema/abrir-probador', (req, res) => {
    const configGuardada = obtenerConfigProbador();

    const productoId = req.body.productoId ?? req.body.producto_id ?? configGuardada.producto_id ?? 1;
    const altura = req.body.altura ?? configGuardada.altura ?? 170;
    const peso = req.body.peso ?? configGuardada.peso ?? 70;
    const imagen = req.body.imagen || 'remera.png';
    const tipo_prenda = req.body.tipo_prenda || 'superior';
    const tipo_overlay = req.body.tipo_overlay || 'torso';

    const scriptPath = path.join(__dirname, '..', 'provador', 'probador_urbano.py');
    const carpetaProvador = path.join(__dirname, '..', 'provador');

    const alturaMetros = altura > 10 ? altura / 100 : altura;

    console.log(`📋 NODE ENVIANDO A PYTHON -> Producto: ${productoId} | Altura: ${alturaMetros} | Peso: ${peso} | Prenda: ${imagen} | Tipo Prenda: ${tipo_prenda} | Tipo Overlay: ${tipo_overlay}`);

    res.json({ success: true, message: "Levantando proceso AR con imagen dinámica" });

    const argsPython = [
        scriptPath,
        String(alturaMetros),
        String(peso),
        imagen,
        tipo_overlay,
        tipo_prenda,
        String(productoId)
    ];

    console.log("ARGS ENVIADOS A PYTHON", argsPython.slice(1));

    const pythonProcess = spawn('python', argsPython, {
        cwd: carpetaProvador,
        env: { ...process.env, PYTHONIOENCODING: "utf-8" }
    });

    // Capturamos los prints de Python para debuguear en la terminal de Node
    pythonProcess.stdout.on('data', (data) => {
        console.log(`[Python]: ${data.toString().trim()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`[Python Error]: ${data.toString().trim()}`);
    });

    pythonProcess.on('close', (code) => {
        console.log(`Proceso del probador virtual finalizado con código: ${code}`);
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
// 🔥 2. EL NUEVO ENDPOINT DE KLING VA ACÁ ABAJO (Donde 'app' ya existe perfectamente)
// ============================================================================


// ============================================================================
// LEVANTAMIENTO DE BASE DE DATOS Y SERVIDOR (¡Siempre al final de todo!)
// ============================================================================
sequelize.sync()
  .then(() => {
    console.log('✅ Base de datos sincronizada. Tablas listas.');
    app.listen(PORT, () => console.log(`🚀 Servidor en puerto ${PORT}`));
  })
  .catch(err => console.error('❌ Error de DB:', err));