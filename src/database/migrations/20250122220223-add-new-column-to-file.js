'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Files', 'description', {
      type: Sequelize.STRING,
      allowNull: true, // Pode ser nulo, mas pode ajustar conforme necessidade
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Files', 'description');
  },
};
