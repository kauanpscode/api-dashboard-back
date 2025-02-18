const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

// Define o modelo User
const User = sequelize.define("User", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  channel: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  shift: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = User;
