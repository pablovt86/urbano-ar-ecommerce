const { Categoria, Producto } = require('../models');
const categoriaController = {
    // Crear una nueva categoría
    crear: async (req, res) => {
        try {
            const nuevaCategoria = await Categoria.create(req.body);
            res.status(201).json({
                mensaje: "Categoría creada con éxito",
                data: nuevaCategoria
            });
        } catch (error) {
            res.status(400).json({ 
                error: "Error al crear categoría", 
                detalle: error.message 
            });
        }
    },



    // Listar todas
    listar: async (req, res) => {
        try {
            const categorias = await Categoria.findAll();
            res.json(categorias);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Actualizar categoría (nombre o imagen)
    actualizar: async (req, res) => {
        try {
            const { id } = req.params;
            await Categoria.update(req.body, { where: { id } });
            res.json({ success: true, mensaje: "Categoría actualizada" });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Eliminar categoría
    eliminar: async (req, res) => {
        try {
            const { id } = req.params;
            
            // OJO: Si eliminas una categoría que tiene productos, 
            // tus productos quedarán con categoria_id = NULL (por el SET NULL que configuraste)
            await Categoria.destroy({ where: { id } });
            
            res.json({ success: true, mensaje: "Categoría eliminada" });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};



module.exports = categoriaController;
