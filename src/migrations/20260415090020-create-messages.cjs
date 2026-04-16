/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("messages", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      conversationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "conversations", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      senderUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      type: {
        type: Sequelize.ENUM("text", "action"),
        allowNull: false,
        defaultValue: "text",
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      action: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      meta: {
        type: Sequelize.JSON,
        allowNull: true,
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

    await queryInterface.addIndex("messages", ["conversationId"]);
    await queryInterface.addIndex("messages", ["senderUserId"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("messages");
  },
};

