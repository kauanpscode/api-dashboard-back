const { Sequelize } = require('sequelize');

// Configuração do banco de dados SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite', // Caminho para o arquivo do banco
  logging: false, // Desativa logs no console
});

module.exports = sequelize;
