const { Carrito, ItemCarrito, Usuario, VariantePrenda, Producto } = require('../models');

const adminController = {
    // Función para ver todas las ventas realizadas
    historialVentas: async (req, res) => {
        try {
            // 1. Buscamos en la tabla Carritos
            const ventas = await Carrito.findAll({
                // 2. Solo nos interesan los que ya terminaron el proceso
                where: { estado: 'completado' },
                // 3. "Traeme también la información de las otras tablas" (Eager Loading)
                include: [
                    {
                        model: Usuario,
                        attributes: ['nombre', 'email'] // Solo datos necesarios del cliente
                    },
                    {
                        model: ItemCarrito,
                        as: 'items',
                        include: [{
                            model: VariantePrenda,
                            as: 'variante',
                            include: [{
                                model: Producto,
                                as: 'Producto', // Para saber qué producto era (Remera, Pantalón, etc.)
                                attributes: ['titulo']
                            }]
                        }]
                    }
                ],
                order: [['updatedAt', 'DESC']] // Ver las ventas más recientes primero
            });

            res.json({
                success: true,
                totalVentas: ventas.length,
                data: ventas
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = adminController;
