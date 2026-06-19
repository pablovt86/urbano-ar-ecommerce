// 🔄 MODIFICACIÓN: Agregamos 'GuiaTalle' a la importación destructurada
const { sequelize, Categoria, Producto, ImagenProducto, VariantePrenda, GuiaTalle } = require('./models'); 

const seedDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('⚡ Conexión establecida para re-poblar la base de datos.');

        // 1. LIMPIAR DATOS CON INCONSISTENCIAS (Agregamos la limpieza de GuiaTalle para evitar duplicados)
        await GuiaTalle.destroy({ where: {} });
        await ImagenProducto.destroy({ where: {} });
        await VariantePrenda.destroy({ where: {} });
        await Producto.destroy({ where: {} });
        await Categoria.destroy({ where: {} });

        console.log('🗑️ Base de datos limpia de registros anteriores.');

        // 2. CREAR CATEGORÍAS REALES
        const catTorso = await Categoria.create({ nombre: 'Torso', imagen_portada: 'hoodie.png' });
        const catPiernas = await Categoria.create({ nombre: 'Piernas', imagen_portada: 'JeansWoman1.jpg' });
        const catAccesorios = await Categoria.create({ nombre: 'Accesorios', imagen_portada: 'DressOrange.jpg' });

        console.log('✅ Categorías creadas.');

        // 3. MATRIZ DE LOS 15 PRODUCTOS (Sincronizados con los nombres reales de imagenData)
        const productosData = [
            { id: 1, titulo: 'Chaqueta Marrón Brown Leather', descripcion: 'Campera de cuero premium con terminaciones urbanas de alta calidad.', precio: 45000.00, categoria_id: catTorso.id },
            { id: 2, titulo: 'Vestido Orange Dress Glam', descripcion: 'Vestido urbano estilizado exclusivo de temporada de diseño vibrante.', precio: 35000.00, categoria_id: catTorso.id },
            { id: 3, titulo: 'Jean Denim Woman Blue 1', descripcion: 'Jean clásico para mujer de calce confortable y alta durabilidad.', precio: 32000.00, categoria_id: catPiernas.id },
            { id: 4, titulo: 'Chaqueta Fleece Isolated Grey', descripcion: 'Buzo abrigado textil premium con aislamiento térmico moderno.', precio: 28000.00, categoria_id: catTorso.id },
            { id: 5, titulo: 'Buzo Hoodie Casual Black', descripcion: 'Buzo frisado premium con capucha y cordones de ajuste urbano.', precio: 26000.00, categoria_id: catTorso.id },
            { id: 6, titulo: 'Pantalón Vaquero Base Femenino', descripcion: 'Jean de corte regular texturizado ideal para combinar en capas.', precio: 27000.00, categoria_id: catPiernas.id },
            { id: 7, titulo: 'Abrigo Largo Fuzzy Coat', descripcion: 'Sobretodo con textura suave al tacto y máxima resistencia al frío.', precio: 55000.00, categoria_id: catTorso.id },
            { id: 8, titulo: 'Tapado Fuzzy Premium Open Center', descripcion: 'Prenda versátil de calce holgado y costuras interiores reforzadas.', precio: 58000.00, categoria_id: catTorso.id },
            { id: 9, titulo: 'Sobretodo Elegante Long Trench', descripcion: 'Corte relajado unisex de alta costura adaptable a cualquier look.', precio: 62000.00, categoria_id: catTorso.id },
            { id: 10, titulo: 'Sobretodo Trench Open Center Gray', descripcion: 'Diseño streetwear minimalista inspirado en la cultura de capas.', precio: 59000.00, categoria_id: catTorso.id },
            { id: 11, titulo: 'Jean Denim Classic Man 1', descripcion: 'Jean vaquero para hombre texturado con moldería recta moderna.', precio: 31000.00, categoria_id: catPiernas.id },
            { id: 12, titulo: 'Jean Slim Man Style 2', descripcion: 'Jean gris oscuro desgastado estilo vintage urbano.', precio: 29000.00, categoria_id: catPiernas.id },
            { id: 13, titulo: 'Top Colores Veraniego Sin Mangas', descripcion: 'Prenda superior ligera ideal para días de verano confortables.', precio: 15000.00, categoria_id: catTorso.id },
            { id: 14, titulo: 'Campera Trench Red Intense', descripcion: 'Impermeable estilizado con detalles de diseño exclusivo.', precio: 48000.00, categoria_id: catTorso.id },
                { id: 15, titulo: 'Combo Upper Trendy Woman 1', descripcion: 'Enfoque de diseño integrado inspirado en la cultura elegante.', precio: 39000.00, categoria_id: catTorso.id }
            ];

        for (const p of productosData) {
            await Producto.create(p);
        }
        console.log('✅ 15 Productos base sincronizados con imagenData.');

        // 4. ASOCIACIÓN DE IMÁGENES
        const imagenesData = [
            { producto_id: 1, url: 'BrownLeatherJacket.png', es_principal: true },
            { producto_id: 2, url: 'DressOrange.png', es_principal: true },
            { producto_id: 3, url: 'JeansWoman1.png', es_principal: true },
            { producto_id: 4, url: 'fleece-jacket-isolated-on-transparent-background-free-png.webp', es_principal: true },
            { producto_id: 5, url: 'hoodie.png', es_principal: true },
            { producto_id: 6, url: 'JeansWoman1.png', es_principal: true }, 
            { producto_id: 7, url: 'LongFuzzyCoat.png', es_principal: true },
            { producto_id: 8, url: 'LongFuzzyCoatWithoutCenter (1).png', es_principal: true },
            { producto_id: 9, url: 'LongTrechCoat.png', es_principal: true },
            { producto_id: 10, url: 'LongTrenchCoatWithoutCenter.png', es_principal: true },
            { producto_id: 11, url: 'ManJeans1.png', es_principal: true },
            { producto_id: 12, url: 'Manjeans2WithoutCenter.png', es_principal: true },
            { producto_id: 13, url: 'TopColoresSinMangas.png', es_principal: true },
            { producto_id: 14, url: 'TrenchRed.png', es_principal: true },
            { producto_id: 15, url: 'TrendyUpperComboWoman1.png', es_principal: true }
        ];

        for (const img of imagenesData) {
            await ImagenProducto.create(img);
        }
        console.log('✅ Galería de imágenes vinculada correctamente.');

        // 5. VARIANTES CON TRANSPARENCIAS RECORTADAS PARA VTON (Probador Virtual)
        const variantesData = [
            { producto_id: 1, talle: 'M', color: 'Marrón', stock: 12, sku: 'JKT-BRN-M', imagen_vton_url: 'BrownLeatherJacket.png' },
            { producto_id: 2, talle: '40', color: 'Naranja', stock: 20, sku: 'DRESS-ORN-40', imagen_vton_url: 'DressOrange.png' },
            { producto_id: 4, talle: 'L', color: 'Gris', stock: 15, sku: 'HD-GRAY-L', imagen_vton_url: 'hoodie.png' },
            { producto_id: 8, talle: 'XL', color: 'Beige', stock: 6, sku: 'COAT-FUZ-XL', imagen_vton_url: 'LongFuzzyCoatWithoutCenter_(1).png' },
            { producto_id: 9, talle: 'M', color: 'Negro', stock: 8, sku: 'TRENCH-M', imagen_vton_url: 'LongTrenchCoatWithoutCenter.png' }
        ];

        for (const varP of variantesData) {
            await VariantePrenda.create(varP);
        }
        console.log('✅ Variantes del probador virtual configuradas.');

        // ============================================================================
        // 🔥 6. AUTOMATIZACIÓN EN MASA DE LA GUÍA DE TALLES (El recomendador inteligente)
        // ============================================================================
        console.log('⏳ Generando tablas dinámicas de GuiaTalles para todos los productos...');
        
        for (const p of productosData) {
            // Para cada uno de los 15 productos, creamos las 5 escalas estandarizadas de talles
            const reglasDelProducto = [
                { producto_id: p.id, talle: 'S',   altura_min_cm: 150, altura_max_cm: 165, peso_min_kg: 45,  peso_max_kg: 64 },
                { producto_id: p.id, talle: 'M',   altura_min_cm: 160, altura_max_cm: 175, peso_min_kg: 65,  peso_max_kg: 75 },
                { producto_id: p.id, talle: 'L',   altura_min_cm: 170, altura_max_cm: 185, peso_min_kg: 76,  peso_max_kg: 85 },
                { producto_id: p.id, talle: 'XL',  altura_min_cm: 170, altura_max_cm: 190, peso_min_kg: 86,  peso_max_kg: 100 }, // 👈 Tu test de 90kg va a calzar ACÁ perfectamente!
                { producto_id: p.id, talle: 'XXL', altura_min_cm: 180, altura_max_cm: 210, peso_min_kg: 101, peso_max_kg: 130 }
            ];

            for (const regla of reglasDelProducto) {
                await GuiaTalle.create(regla);
            }
        }

        console.log('✅ Base de datos de GuiaTalles poblada automáticamente con 75 registros de análisis.');
        console.log('🚀 ¡Proceso de Seed completado con éxito absoluto!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error inyectando el Seed estructurado:', error);
        process.exit(1);
    }
};

seedDatabase();