"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Payments", {
      Payments_ID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Order_Items_ID: {
        type: Sequelize.INTEGER,
      },
      Payment_Method: {
        type: Sequelize.STRING,
      },
      Payment_Status: {
        type: Sequelize.STRING,
      },
      Amount: {
        type: Sequelize.FLOAT,
      },
      Paid: {
        type: Sequelize.BOOLEAN,
      },
      Transaction_ID: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Payments");
  },
};
