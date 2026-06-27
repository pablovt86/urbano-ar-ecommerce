const { Carrito, ItemCarrito, Usuario, VariantePrenda, Producto, ImagenProducto, Categoria, ConfiguracionProbador } = require('../models');

const adminController = {
    // 📊 1. VER HISTORIAL DE VENTAS COMPLETADAS (Tu funcionalidad base)
    historialVentas: async (req, res) => {
        try {
            const ventas = await Carrito.findAll({
                where: { estado: 'completado' },
                include: [
                    {
                        model: Usuario,
                        attributes: ['nombre', 'email']
                    },
                    {
                        model: ItemCarrito,
                        as: 'items',
                        include: [{
                            model: VariantePrenda,
                            as: 'variante',
                            include: [{
                                model: Producto,
                                as: 'Producto',
                                attributes: ['titulo']
                            }]
                        }]
                    }
                ],
                order: [['updatedAt', 'DESC']]
            });

            res.json({
                success: true,
                totalVentas: ventas.length,
                data: ventas
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // ➕ 2. CREAR PRODUCTO CON SUS RELACIONES (Imágenes y Variantes nativas)
    crearProducto: async (req, res) => {
        try {
            const { titulo, descripcion, precio, categoria_id, es_nuevo, destacado, imagenes, variantes, tipo_prenda, tipo_overlay } = req.body;

            const nuevoProducto = await Producto.create({
                titulo,
                descripcion,
                precio,
                categoria_id,
                es_nuevo,
                destacado,
                tipo_prenda,
                tipo_overlay,
                imagenes: imagenes || [], 
                variantes: variantes || []
            }, { 
                include: [
                    { model: ImagenProducto, as: 'imagenes' },
                    { model: VariantePrenda, as: 'variantes' }
                ] 
            });

            res.status(201).json({
                success: true,
                mensaje: 'Producto creado exitosamente desde el panel de administración',
                producto: nuevoProducto
            });
        } catch (error) {
            console.error('Error al crear producto desde Admin:', error);
            res.status(500).json({ success: false, error: 'Hubo un error al crear el producto' });
        }
    },

    // 🔍 3. OBTENER TODO EL CATÁLOGO DETALLADO (Para armar la grilla/tabla del Admin)
    obtenerTodosProductos: async (req, res) => {
        try {
            const productos = await Producto.findAll({
                include: [
                    { model: ImagenProducto, as: 'imagenes' },
                    { model: VariantePrenda, as: 'variantes' },
                    { model: Categoria, as: 'categoria' },
                    { model: ConfiguracionProbador, as: 'configuracion_probador' }
                ],
                order: [['id', 'DESC']]
            });
            res.json({ success: true, data: productos });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // 🎯 4. OBTENER UN SOLO PRODUCTO (Para cargar el formulario de edición)
    obtenerUnoProducto: async (req, res) => {
        try {
            const producto = await Producto.findByPk(req.params.id, {
                include: ['imagenes', 'variantes', 'categoria', 'configuracion_probador']
            });
            if (!producto) return res.status(404).json({ success: false, mensaje: "Producto no encontrado" });
            
            res.json({ success: true, data: producto });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // 🔄 5. ACTUALIZAR PRODUCTO (Datos Básicos)
    actualizarProducto: async (req, res) => {
        try {
            const { id } = req.params;
            const [actualizado] = await Producto.update(req.body, { where: { id } });
            
            if (actualizado === 0) {
                return res.status(404).json({ success: false, mensaje: "Producto no encontrado o sin cambios" });
            }

            res.json({ success: true, mensaje: "Producto actualizado (datos básicos)" });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    },

    // ❌ 6. ELIMINAR PRODUCTO (Borrado físico y en cascada de dependencias)
    eliminarProducto: async (req, res) => {
        try {
            const { id } = req.params;
            const borrado = await Producto.destroy({ where: { id } });
            
            if (borrado) {
                res.json({ success: true, mensaje: "Producto y sus dependencias eliminados de la base de datos" });
            } else {
                res.status(404).json({ success: false, mensaje: "No se encontró el producto solicitado" });
            }
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // 📦 7. ACTUALIZAR STOCK DE UNA VARIANTE ESPECÍFICA (Rápido desde la interfaz)
    actualizarStockVariante: async (req, res) => {
        try {
            const { id } = req.params; 
            const { nuevoStock } = req.body;

            const variante = await VariantePrenda.findByPk(id);
            
            if (!variante) {
                return res.status(404).json({ success: false, error: "Variante no encontrada" });
            }

            variante.stock = nuevoStock;
            await variante.save();

            res.json({ 
                success: true, 
                mensaje: `Stock actualizado a ${nuevoStock} para el SKU: ${variante.sku}` 
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

module.exports = adminController;