"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("category_details", {
      category_detail_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      origin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      size: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      roastLevel: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      processing: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      categories_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Categories",
          key: "categories_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("category_details");
  },
};
