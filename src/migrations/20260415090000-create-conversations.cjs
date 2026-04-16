/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("conversations", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "support",
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "open",
      },
      createdByUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("conversations");
  },
};

