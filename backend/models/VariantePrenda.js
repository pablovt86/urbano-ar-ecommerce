const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Producto = require('./Producto');

const VariantePrenda = sequelize.define('VariantePrenda', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  talle: { type: DataTypes.STRING, allowNull: false },
  color: { type: DataTypes.STRING },
  imagen_url: { type: DataTypes.STRING, allowNull: false } // Crucial para mandar a la IA
}, { timestamps: false });

// Asociaciones (Un producto tiene muchas variantes)
Producto.hasMany(VariantePrenda, { foreignKey: 'producto_id', as: 'variantes' });
VariantePrenda.belongsTo(Producto, { foreignKey: 'producto_id' });

module.exports = VariantePrenda;