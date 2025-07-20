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
      },
      Users_ID: {
        type: Sequelize.INTEGER,
      },
      Cartegories_ID: {
        type: Sequelize.INTEGER,
      },
      Description: {
        type: Sequelize.TEXT,
      },
      Price: {
        type: Sequelize.FLOAT,
      },
      Stock: {
        type: Sequelize.INTEGER,
      },
      Image: {
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
    await queryInterface.dropTable("Products");
  },
};
