const { Producto, ImagenProducto, VariantePrenda, Categoria,ConfiguracionProbador} = require('../models');


const productoController = {
  crearProducto: async (req, res) => {
  try {
    const { titulo, descripcion, precio, categoria_id, es_nuevo, destacado, imagenes, variantes, tipo_prenda, tipo_overlay } = req.body;

    // Sequelize permite crear el registro principal y sus relaciones al mismo tiempo
   const nuevoProducto = await Producto.create({
    titulo,
    descripcion,
    precio,
    categoria_id,
    es_nuevo,
    destacado,
    tipo_prenda,
    tipo_overlay,
    // Si no vienen imagenes o variantes, enviamos un array vacío
    imagenes: imagenes || [], 
    variantes: variantes || []
}, { 
    include: [
        { model: ImagenProducto, as: 'imagenes' },
        { model: VariantePrenda, as: 'variantes' }
        
    ] 
});
   console.log("ID solicitado:", req.params.id);
   console.log("Variantes:", producto.variantes);
    res.status(201).json({
      success: true,
      mensaje: 'Producto creado exitosamente',
      producto: nuevoProducto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ success: false, error: 'Hubo un error al crear el producto' });
  }
},


    // 1. OBTENER TODOS (Para la tabla del admin)
    obtenerTodos: async (req, res) => {
        try {
            const productos = await Producto.findAll({
                include: [
                    { model: ImagenProducto, as: 'imagenes' },
                    { model: VariantePrenda, as: 'variantes' },
                    { model: Categoria, as: 'categoria' },
                    { model: ConfiguracionProbador, as: 'configuracion_probador' }
                ]
            });
            res.json(productos);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 2. OBTENER UNO SOLO (Para ver detalle o editar)
    obtenerUno: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id, {
                include: ['imagenes', 'variantes', 'categoria', 'configuracion_probador']
            });
            if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
            res.json(producto);
            console.log(JSON.stringify(producto, null, 2));
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // 3. ACTUALIZAR (PUT)
    actualizar: async (req, res) => {
        try {
            const { id } = req.params;
            // Actualizamos los datos básicos del producto
            await Producto.update(req.body, { where: { id } });
            
            res.json({ success: true, mensaje: "Producto actualizado (datos básicos)" });
            // Nota: Actualizar imágenes/variantes anidadas es más complejo, 
            // generalmente se hace con rutas específicas para borrar/agregar cada una.
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // 4. ELIMINAR (DELETE)
    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            const borrado = await Producto.destroy({ where: { id } });
            
            if (borrado) {
                res.json({ success: true, mensaje: "Producto y sus dependencias eliminados" });
            } else {
                res.status(404).json({ mensaje: "No se encontró el producto" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    actualizarStockVariante: async (req, res) => {
    try {
        const { id } = req.params; // ID de la variante
        const { nuevoStock } = req.body;

        const variante = await VariantePrenda.findByPk(id);
        
        if (!variante) {
            return res.status(404).json({ error: "Variante no encontrada" });
        }

        variante.stock = nuevoStock;
        await variante.save();

        res.json({ 
            success: true, 
            mensaje: `Stock actualizado a ${nuevoStock} para el SKU: ${variante.sku}` 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
};

module.exports = productoController;
