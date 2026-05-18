const { Producto, GuiaTalle } = require('../models');

const recomendarTalle = async (req, res) => {
  try {
    console.log('Recibiendo datos para recomendación de talle:', req.body);
    const { producto_id, altura_cm, peso_kg, preferencia_calce = 'regular' } = req.body;

    // Validación básica
    if (!producto_id || !altura_cm || !peso_kg) {
      return res.status(400).json({ success: false, error: 'Faltan datos requeridos (producto_id, altura, peso).' });
    }

    // Traemos las reglas de la base de datos ordenadas por tamaño
    const reglas = await GuiaTalle.findAll({
      where: { producto_id },
      order: [['peso_min_kg', 'ASC']]
    });

    if (reglas.length === 0) {
      return res.status(404).json({ success: false, error: 'No hay medidas registradas para este producto.' });
    }

    let mejorTalle = null;
    let motivo = '';
    let talleCandidatoPeso = null;
    let talleCandidatoAltura = null;

    // Evaluamos cada regla
    for (const regla of reglas) {
      const cumpleAltura = altura_cm >= regla.altura_min_cm && altura_cm <= regla.altura_max_cm;
      const cumplePeso = peso_kg >= regla.peso_min_kg && peso_kg <= regla.peso_max_kg;

      if (cumplePeso) talleCandidatoPeso = regla.talle;
      if (cumpleAltura) talleCandidatoAltura = regla.talle;

      // Si es un match perfecto
      if (cumpleAltura && cumplePeso) {
        mejorTalle = regla.talle;
        motivo = 'Match perfecto según tu altura y peso.';
        break;
      }
    }

    // Si no hubo match perfecto, tomamos decisiones (Priorizamos el peso para que la prenda "cierre" o entre bien de ancho)
    if (!mejorTalle) {
      if (talleCandidatoPeso) {
        mejorTalle = talleCandidatoPeso;
        motivo = 'Basado principalmente en tu contextura física.';
      } else if (talleCandidatoAltura) {
        mejorTalle = talleCandidatoAltura;
        motivo = 'Basado en tu altura para asegurar el largo adecuado.';
      } else {
        // Si se sale de todas las tablas, le damos el más grande por defecto
        mejorTalle = reglas[reglas.length - 1].talle;
        motivo = 'Tus medidas superan la tabla estándar, te recomendamos el talle más amplio.';
      }
    }

    // Ajuste por preferencia del usuario (Si quiere que le quede más suelto)
    if (preferencia_calce === 'suelto' || preferencia_calce === 'oversize') {
       // Buscar el siguiente talle más grande si existe
       const indexActual = reglas.findIndex(r => r.talle === mejorTalle);
       if (indexActual < reglas.length - 1) {
           mejorTalle = reglas[indexActual + 1].talle;
           motivo = 'Te sugerimos un talle más grande según tu preferencia de calce holgado.';
       }
    }

    return res.status(200).json({
      success: true,
      recomendacion: {
        talle: mejorTalle,
        explicacion: motivo
      }
    });

  } catch (error) {
    console.error('Error en recomendador de talles:', error);
    res.status(500).json({ success: false, error: 'Error interno del servidor al calcular el talle.' });
  }
};

module.exports =  recomendarTalle ;