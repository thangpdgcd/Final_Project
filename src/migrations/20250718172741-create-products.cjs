"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Products", {
      Products_ID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      Users_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Categories_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      Price: {
        type: Sequelize.FLOAT,
        allowNull: false,
      },
      Stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Image: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Products");
  },
};
