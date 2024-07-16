const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Analysis = sequelize.define('Analysis', {
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  results: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Analysis;