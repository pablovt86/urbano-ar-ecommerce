const { Carrito, ItemCarrito, VariantePrenda, Producto } = require('../models');

const carritoController = {
    // Agregar producto al carrito
    agregarItem: async (req, res) => {
        try {
            const { usuario_id, variante_id, cantidad } = req.body;

            // 1. Buscar o Crear el carrito activo para el usuario
            let [carrito, creado] = await Carrito.findOrCreate({
                where: { usuario_id, estado: 'activo' },
                defaults: { total: 0 }
            });

            // 2. Verificar si la variante existe y tiene stock
            const variante = await VariantePrenda.findByPk(variante_id);
            if (!variante || variante.stock < cantidad) {
                return res.status(400).json({ error: "Stock insuficiente o variante no encontrada" });
            }

            // 3. Verificar si el item ya existe en el carrito
            let item = await ItemCarrito.findOne({
                where: { carrito_id: carrito.id, variante_id }
            });

            if (item) {
                // Si ya existe, sumamos la cantidad
                item.cantidad += cantidad;
                await item.save();
            } else {
                // Si no existe, lo creamos
                // Necesitamos el precio de la variante o del producto (ajusta según tu lógica)
                // Aquí asumo que el precio está en el Producto asociado a la variante
                const producto = await Producto.findByPk(variante.producto_id);
                
                item = await ItemCarrito.create({
                    carrito_id: carrito.id,
                    variante_id,
                    cantidad,
                    precio_unitario: producto.precio 
                });
            }

            // 4. (Opcional) Recalcular el total del carrito aquí o al consultar
            
            res.status(201).json({ success: true, mensaje: "Producto agregado al carrito", item });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Ver el contenido del carrito
    verCarrito: async (req, res) => {
        try {
            const { usuario_id } = req.params;
            const carrito = await Carrito.findOne({
                where: { usuario_id, estado: 'activo' },
                include: [{
                    model: ItemCarrito,
                    as: 'items',
                    include: [{
                        model: VariantePrenda,
                        as: 'variante',
                        include: ['Producto'] // Para ver el nombre del producto
                    }]
                }]
            });

            if (!carrito) return res.status(404).json({ mensaje: "Carrito vacío" });
            res.json(carrito);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    finalizarCompra: async (req, res) => {
    // Usamos una Transacción para que si algo falla, no se reste stock por error
    const t = await sequelize.transaction();

    try {
        const { usuario_id } = req.body;

        // 1. Buscar el carrito activo con sus items
        const carrito = await Carrito.findOne({
            where: { usuario_id, estado: 'activo' },
            include: [{ model: ItemCarrito, as: 'items' }],
            transaction: t
        });

        if (!carrito || carrito.items.length === 0) {
            return res.status(400).json({ error: "El carrito está vacío" });
        }

        // 2. Procesar cada item: Verificar y Restar Stock
        for (const item of carrito.items) {
            const variante = await VariantePrenda.findByPk(item.variante_id, { transaction: t });

            if (variante.stock < item.cantidad) {
                throw new Error(`Stock insuficiente para la variante ${variante.sku}`);
            }

            // Restar el stock
            variante.stock -= item.cantidad;
            await variante.save({ transaction: t });
        }

        // 3. Cambiar estado del carrito a 'completado'
        carrito.estado = 'completado';
        await carrito.save({ transaction: t });

        // 4. Confirmar todo el proceso
        await t.commit();

        res.json({ 
            success: true, 
            mensaje: "Compra realizada con éxito. El stock ha sido actualizado." 
        });

    } catch (error) {
        // Si algo salió mal, deshacemos todos los cambios
        await t.rollback();
        res.status(400).json({ error: error.message });
    }
}
};

module.exports = carritoController;
