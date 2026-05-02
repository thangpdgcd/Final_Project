"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Orders", "payment_method", {
      type: Sequelize.STRING(32),
      allowNull: true,
    });

    await queryInterface.addColumn("Orders", "payment_status", {
      type: Sequelize.STRING(32),
      allowNull: true,
    });

    await queryInterface.addColumn("Orders", "payment_provider", {
      type: Sequelize.STRING(64),
      allowNull: true,
    });

    await queryInterface.addColumn("Orders", "payment_ref", {
      type: Sequelize.STRING(128),
      allowNull: true,
    });

    await queryInterface.addColumn("Orders", "paid_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Orders", "paid_at");
    await queryInterface.removeColumn("Orders", "payment_ref");
    await queryInterface.removeColumn("Orders", "payment_provider");
    await queryInterface.removeColumn("Orders", "payment_status");
    await queryInterface.removeColumn("Orders", "payment_method");
  },
};

