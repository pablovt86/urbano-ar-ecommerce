const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql', // Acá hacemos el switch oficial a MySQL
    logging: false,   // Ponelo en console.log si querés ver las queries SQL crudas
  }
);

module.exports = sequelize;