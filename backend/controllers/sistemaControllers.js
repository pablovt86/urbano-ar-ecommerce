const fs = require('fs');
const path = require('path');

// 🛡️ VARIABLE GLOBAL ANTIRÁFAGAS
let bloqueoPeticionEnCurso = false;

const procesarVestidorIA = async (req, res) => {
    // Escudo antiráfagas clásico
    if (bloqueoPeticionEnCurso) {
        console.log("🛑 [Backend Shield] Intento de petición paralela bloqueado.");
        return res.status(429).json({ success: false, error: 'Hay un procesamiento en curso.' });
    }

    try {
        bloqueoPeticionEnCurso = true;
        const { foto_usuario_base64, url_prenda_catalogo } = req.body;

        if (!foto_usuario_base64) {
            bloqueoPeticionEnCurso = false;
            return res.status(400).json({ success: false, error: 'Faltan datos de la captura.' });
        }

        console.log('🔮 [Bridge Engine] Recibiendo outfit mapeado en tiempo real desde el Front...');

        // Opcional: Si querés guardar un registro de las fotos que se saca la gente, tu código sigue estando listo
        let base64Pure = foto_usuario_base64.startsWith('data:') 
            ? foto_usuario_base64.replace(/^data:image\/[a-z]+;base64,/, "") 
            : foto_usuario_base64;
        base64Pure = base64Pure.trim().replace(/\s/g, '');

        const nombreArchivo = `outfit-${Date.now()}.jpg`;
        const rutaFisicaGuardado = path.join(__dirname, '..', 'public', 'images', nombreArchivo);
        
        // Guardamos la foto final con el buzo ya puesto para tu base de datos o historial
        fs.writeFileSync(rutaFisicaGuardado, base64Pure, 'base64');
        console.log(`💾 ¡Outfit final guardado con éxito en el servidor!: ${nombreArchivo}`);

        // Apagamos el semáforo
        bloqueoPeticionEnCurso = false;

        // Le devolvemos el OK rotundo al Front pasándole el mismo Base64 para que pase al Paso 2
        return res.status(200).json({ 
            success: true, 
            imagen_fusionada: foto_usuario_base64 
        });

    } catch (error) {
        console.error('❌ Error crítico en el puente:', error);
        bloqueoPeticionEnCurso = false;
        return res.status(500).json({ success: false, error: 'Falla interna en el servidor puente.' });
    }
};

module.exports = { procesarVestidorIA };