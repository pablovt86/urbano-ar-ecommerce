const { VariantePrenda, Producto } = require('../models');
const { Op } = require('sequelize'); // Importamos operadores de Sequelize

const stockController = {
    // Reporte de productos con stock crítico
    reporteBajoStock: async (req, res) => {
        try {
            const limite = req.query.limite || 5; // Por defecto busca menos de 5 unidades

            const alertas = await VariantePrenda.findAll({
                where: {
                    stock: {
                        [Op.lt]: limite // Filtra: stock < limite
                    }
                },
                include: [{
                    model: Producto,
                    as: 'Producto', // Asegúrate que coincida con tu alias en la asociación
                    attributes: ['titulo'] // Solo traemos el nombre del producto para no sobrecargar
                }],
                order: [['stock', 'ASC']] // Los más críticos primero
            });

            res.json({
                total_alertas: alertas.length,
                limite_consultado: limite,
                data: alertas
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = stockController;
