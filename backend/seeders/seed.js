const { 
    sequelize, Usuario, Categoria, Producto, 
    ImagenProducto, VariantePrenda, Carrito, ItemCarrito 
} = require('./../models'); // Ajusta la ruta a tus modelos
const bcrypt = require('bcryptjs');

const poblarBaseDeDatos = async () => {
    try {
        // 1. Limpiar y sincronizar (CUIDADO: Borra datos actuales)
        await sequelize.sync({ force: true });
        console.log('--- DB Limpia y Sincronizada ---');

        // 2. Crear un Administrador y Clientes
        const passwordHash = await bcrypt.hash('123456', 10);
        const admin = await Usuario.create({
            nombre: 'Admin Urbano',
            email: 'admin@urbano.com',
            password_hash: passwordHash,
            rol: 'admin'
        });

        const clientes = [];
        for (let i = 1; i <= 10; i++) {
            clientes.push(await Usuario.create({
                nombre: `Cliente ${i}`,
                email: `cliente${i}@gmail.com`,
                password_hash: passwordHash,
                rol: 'cliente'
            }));
        }

        // 3. Crear Categorías
        const cats = await Categoria.bulkCreate([
            { nombre: 'Remeras', imagen_portada: 'url_remeras' },
            { nombre: 'Pantalones', imagen_portada: 'url_pantalones' },
            { nombre: 'Zapatillas', imagen_portada: 'url_zapatillas' }
        ]);

        // 4. Crear Productos con Variantes e Imágenes
        const productosData = [
            { titulo: 'Remera Oversize Cotton', precio: 15000, cat: cats[0].id },
            { titulo: 'Jean Slim Fit Blue', precio: 35000, cat: cats[1].id },
            { titulo: 'Sneakers Urban White', precio: 55000, cat: cats[2].id },
            { titulo: 'Hoodie Black Night', precio: 28000, cat: cats[0].id },
            { titulo: 'Cargo Pant Khaki', precio: 32000, cat: cats[1].id }
        ];

        const variantesCreadas = [];
        for (const p of productosData) {
            const nuevoP = await Producto.create({
                titulo: p.titulo,
                descripcion: 'Producto de alta calidad urbana.',
                precio: p.precio,
                categoria_id: p.cat
            });

            // Creamos 3 variantes por producto
            const vars = await VariantePrenda.bulkCreate([
                { talle: 'S', color: 'Negro', stock: 100, sku: `SKU-${nuevoP.id}-S`, producto_id: nuevoP.id },
                { talle: 'M', color: 'Negro', stock: 100, sku: `SKU-${nuevoP.id}-M`, producto_id: nuevoP.id },
                { talle: 'L', color: 'Negro', stock: 100, sku: `SKU-${nuevoP.id}-L`, producto_id: nuevoP.id }
            ]);
            variantesCreadas.push(...vars);
        }

        // 5. GENERAR 50 VENTAS CON LÓGICA
        console.log('Generando 50 ventas...');

        for (let i = 0; i < 50; i++) {
            // Elegir un cliente al azar
            const clienteAleatorio = clientes[Math.floor(Math.random() * clientes.length)];
            
            // Crear el carrito
            const carrito = await Carrito.create({
                usuario_id: clienteAleatorio.id,
                estado: 'completado',
                total: 0 // Lo calcularemos ahora
            });

            // Cada venta tendrá entre 1 y 3 productos distintos
            const cantItems = Math.floor(Math.random() * 3) + 1;
            let totalCarrito = 0;

            for (let j = 0; j < cantItems; j++) {
                const variante = variantesCreadas[Math.floor(Math.random() * variantesCreadas.length)];
                const cantidad = Math.floor(Math.random() * 2) + 1; // 1 o 2 unidades
                
                // Traer precio del producto para el item
                const prodAsoc = await Producto.findByPk(variante.producto_id);
                const subtotal = prodAsoc.precio * cantidad;

                await ItemCarrito.create({
                    carrito_id: carrito.id,
                    variante_id: variante.id,
                    cantidad: cantidad,
                    precio_unitario: prodAsoc.precio
                });

                // Restar stock real
                variante.stock -= cantidad;
                await variante.save();

                totalCarrito += subtotal;
            }

            // Actualizar el total final del carrito
            carrito.total = totalCarrito;
            await carrito.save();
        }

        console.log('✅ ¡Población completada con éxito!');
        process.exit();

    } catch (error) {
        console.error('❌ Error al poblar:', error);
        process.exit(1);
    }
};

poblarBaseDeDatos();
