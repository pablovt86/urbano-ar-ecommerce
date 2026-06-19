const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();


const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
    }
);

// ==========================================
// 2. DEFINICIÓN DE MODELOS
// ==========================================

const Usuario = sequelize.define('Usuario', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    altura_cm: { type: DataTypes.INTEGER },
    peso_kg: { type: DataTypes.DECIMAL(5, 2) },
    // CORRECCIÓN: El rol estaba dentro de peso_kg, ahora está afuera
    rol: { 
        type: DataTypes.ENUM('admin', 'cliente'), 
        defaultValue: 'cliente',
        allowNull: false
    }
});

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
    destacado: { type: DataTypes.BOOLEAN, defaultValue: false },
    tipo_prenda: {type: DataTypes.ENUM('superior','inferior', 'completo'),allowNull: false,defaultValue: 'superior'},
    tipo_overlay: {type: DataTypes.ENUM('torso','piernas','cuerpo_completo'),allowNull: false,defaultValue: 'torso'
}

});


const ConfiguracionProbador = sequelize.define('ConfiguracionProbador',{

        tipo_overlay: DataTypes.STRING,

        anchor_top_left_x: DataTypes.FLOAT,
        anchor_top_left_y: DataTypes.FLOAT,

        anchor_top_right_x: DataTypes.FLOAT,
        anchor_top_right_y: DataTypes.FLOAT,

        anchor_bottom_left_x: DataTypes.FLOAT,
        anchor_bottom_left_y: DataTypes.FLOAT,

        anchor_bottom_right_x: DataTypes.FLOAT,
        anchor_bottom_right_y: DataTypes.FLOAT
    }
);


const ImagenProducto = sequelize.define('ImagenProducto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    url: { type: DataTypes.STRING, allowNull: false },
    es_principal: { type: DataTypes.BOOLEAN, defaultValue: false }
}, { timestamps: false });

const VariantePrenda = sequelize.define('VariantePrenda', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    producto_id: {type: DataTypes.INTEGER,allowNull: false},
    talle: { type: DataTypes.STRING, allowNull: false },
    color: { type: DataTypes.STRING, allowNull: false },
    stock: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
    sku: { type: DataTypes.STRING, unique: true },
    imagen_vton_url: { type: DataTypes.STRING }
});

const Carrito = sequelize.define('Carrito', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    estado: { type: DataTypes.ENUM('activo', 'procesando_pago', 'completado', 'abandonado'), defaultValue: 'activo' },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0.00 }
});

const ItemCarrito = sequelize.define('ItemCarrito', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    cantidad: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});
// Agregá esto junto a tus otros modelos en models/index.js
const GuiaTalle = sequelize.define('GuiaTalle', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  talle: { type: DataTypes.STRING, allowNull: false }, // 'S', 'M', 'L', 'XL', 'XXL'
  sexo_modelo: { type: DataTypes.ENUM('unisex', 'hombre', 'mujer'), defaultValue: 'unisex' },
  altura_min_cm: { type: DataTypes.INTEGER, allowNull: false },
  altura_max_cm: { type: DataTypes.INTEGER, allowNull: false },
  peso_min_kg: { type: DataTypes.DECIMAL(5, 2), allowNull: false },
  peso_max_kg: { type: DataTypes.DECIMAL(5, 2), allowNull: false }
}, { timestamps: false });

// Y en la sección de ASOCIACIONES (al final del archivo), agregás:
Producto.hasMany(GuiaTalle, { foreignKey: 'producto_id', as: 'guia_talles', onDelete: 'CASCADE' });
GuiaTalle.belongsTo(Producto, { foreignKey: 'producto_id' });

// No te olvides de exportarlo al final:
// module.exports = { ..., GuiaTalle };

// ==========================================
// 3. ASOCIACIONES (RELACIONES SQL)
// ==========================================

// CATEGORIA <-> PRODUCTO
Categoria.hasMany(Producto, { foreignKey: 'categoria_id', as: 'productos' });
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });

// PRODUCTO <-> IMAGENES
// 🔄 CORRECCIÓN CRUCIAL: Sincronizamos foreignKey y alias en ambos sentidos
Producto.hasMany(ImagenProducto, { foreignKey: 'producto_id', as: 'imagenes', onDelete: 'CASCADE' });
ImagenProducto.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' }); 

// 🔄 CORRECCIÓN VARIANTES: Aseguramos consistencia de mayúsculas/minúsculas
Producto.hasMany(VariantePrenda, { foreignKey: 'producto_id', as: 'variantes', onDelete: 'CASCADE' });
VariantePrenda.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

// USUARIO <-> CARRITO
Usuario.hasMany(Carrito, { foreignKey: 'usuario_id' });
Carrito.belongsTo(Usuario, { foreignKey: 'usuario_id' });

// CARRITO <-> ITEM_CARRITO
Carrito.hasMany(ItemCarrito, { foreignKey: 'carrito_id', as: 'items', onDelete: 'CASCADE' });
ItemCarrito.belongsTo(Carrito, { foreignKey: 'carrito_id' });

// VARIANTE <-> ITEM_CARRITO (CRUCIAL PARA EL CARRITO)
VariantePrenda.hasMany(ItemCarrito, { foreignKey: 'variante_id' });
ItemCarrito.belongsTo(VariantePrenda, { foreignKey: 'variante_id', as: 'variante' });

// CONFIGURACION PROBADOR <-> PRODUCTO (1 a 1)
Producto.hasOne(ConfiguracionProbador, {
    foreignKey: 'producto_id',
    as: 'configuracion_probador',
    onDelete: 'CASCADE'
});

ConfiguracionProbador.belongsTo(Producto, {
    foreignKey: 'producto_id',
    as: 'producto'
});

module.exports = { sequelize, Usuario, Categoria, Producto, ImagenProducto, VariantePrenda, Carrito, ItemCarrito , GuiaTalle, ConfiguracionProbador};
