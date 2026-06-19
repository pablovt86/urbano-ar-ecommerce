const axios = require('axios');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 1. REUTILIZAMOS TU CONEXIÓN NATIVA DE SEQUELIZE
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false,
    }
);

// 2. INYECTAMOS TUS MODELOS EXACTOS
const Categoria = sequelize.define('Categoria', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false, unique: true },
    imagen_portada: { type: DataTypes.STRING }
});

const Producto = sequelize.define('Producto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    titulo: { type: DataTypes.STRING, allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    precio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    es_nuevo: { type: DataTypes.BOOLEAN, defaultValue: false },
    destacado: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const ImagenProducto = sequelize.define('ImagenProducto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING, allowNull: false },
    es_principal: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: false });

const VariantePrenda = sequelize.define('VariantePrenda', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    talle: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    sku: { type: DataTypes.STRING, unique: true },
    imagen_vton_url: { type: DataTypes.STRING }
});

// ============================================================================
// CORRECCIÓN DE ALTA PRECISIÓN: MAPEAMOS TUS ASOCIACIONES REALES (SNAKE_CASE)
// ============================================================================
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

Producto.hasMany(ImagenProducto, { foreignKey: 'producto_id', as: 'imagenes', onDelete: 'CASCADE' });
ImagenProducto.belongsTo(Producto, { foreignKey: 'producto_id' });

Producto.hasMany(VariantePrenda, { foreignKey: 'producto_id', as: 'variantes', onDelete: 'CASCADE' });
VariantePrenda.belongsTo(Producto, { foreignKey: 'producto_id', as: 'Producto' });

// CONFIGURACIÓN DE LAS BÚSQUEDAS DE IMÁGENES REALES
const UNSPLASH_ACCESS_KEY = 'HvgvlAEjR0ZuObD_IVt6CsoiE3ucRaIM4g_cfMBMbbk'; // Acordate de poner tu clave real acá
const categoriasBusqueda = ["urban t-shirt black", "streetwear graphic tee", "oversized t-shirt urban"];
const tallesDisponibles = ['S', 'M', 'L', 'XL'];

async function buscarEnUnsplash(query) {
    try {
        const response = await axios.get('https://api.unsplash.com/search/photos', {
            params: { query: query, per_page: 10, orientation: 'portrait' },
            headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
        });
        return response.data.results;
    } catch (error) {
        console.error(`Error en Unsplash para ${query}:`, error.message);
        return [];
    }
}

async function poblarECommerce() {
    try {
        await sequelize.authenticate();
        console.log("🚀 Conexión con Sequelize e inyección de asociaciones verificada con éxito.");

        // 1. Buscamos o creamos la categoría usando tu estructura
        const [categoriaStreetwear] = await Categoria.findOrCreate({
            where: { nombre: 'Streetwear' },
            defaults: { imagen_portada: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e' }
        });

        let productosCreados = 0;

        for (const termino of categoriasBusqueda) {
            console.log(`🔍 Descargando prendas de Unsplash para la colección: "${termino}"...`);
            const fotos = await buscarEnUnsplash(termino);

            for (const [index, foto] of fotos.entries()) {
                const tituloProducto = `Remera ${termino.split(' ')[0]} ${foto.color || 'Urban'} St. ${index + 1}`;
                const precioAleatorio = Math.floor(Math.random() * (32000 - 19000 + 1)) + 19000;

                // 2. Insertamos el producto vinculándolo a 'categoria_id'
                const [producto, creado] = await Producto.findOrCreate({
                    where: { titulo: tituloProducto },
                    defaults: {
                        descripcion: foto.alt_description || `Prenda de corte urbano premium. Fotografía real por Unsplash. ID: ${foto.id}`,
                        precio: precioAleatorio,
                        es_nuevo: true,
                        destacado: index % 3 === 0,
                        categoria_id: categoriaStreetwear.id // <-- AJUSTADO A TU COLUMNA REAL EN MYSQL
                    }
                });

                if (creado) {
                    productosCreados++;

                    // 3. Insertamos la foto del catálogo usando 'producto_id'
                    await ImagenProducto.create({
                        url: foto.urls.regular,
                        es_principal: true,
                        producto_id: producto.id // <-- AJUSTADO A TU COLUMNA REAL EN MYSQL
                    });

                    // 4. Creamos las variantes físicas de talle acopladas a tu probador_urbano.py
                    for (const talle of tallesDisponibles) {
                        // Si la búsqueda incluye la palabra "black" le asignamos la máscara negra, si no, la común
                        const mascaraVTON = termino.includes('black') ? 'remera_negra.png' : 'remera.png';

                        await VariantePrenda.create({
                            talle: talle,
                            color: foto.color || 'Negro',
                            stock: Math.floor(Math.random() * 15) + 5,
                            sku: `URB-${producto.id}-${talle}-${foto.id.substring(0, 3).toUpperCase()}`,
                            imagen_vton_url: mascaraVTON, // La ruta que usará el script de Python
                            producto_id: producto.id     // <-- AJUSTADO A TU COLUMNA REAL EN MYSQL
                        });
                    }
                }
            }
            // Retraso protector para cuidar la cuota de la API de Unsplash
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(`\n📊 REPORTE DE EJECUCIÓN EXITOSA:`);
        console.log(`✅ Se registraron ${productosCreados} nuevos productos con mapeo snake_case.`);
        console.log(`👕 Estructura de variantes físicas vinculada correctamente para Realidad Aumentada.`);

    } catch (error) {
        console.error("❌ Error en el proceso de población:", error);
    } finally {
        await sequelize.close();
    }
}

poblarECommerce();