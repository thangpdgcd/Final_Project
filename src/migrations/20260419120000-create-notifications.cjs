/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("notifications", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "user_ID",
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("order", "chat", "system", "voucher"),
        allowNull: false,
        defaultValue: "system",
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    await queryInterface.addIndex("notifications", ["user_ID"]);
    await queryInterface.addIndex("notifications", ["user_ID", "isRead"]);
    await queryInterface.addIndex("notifications", ["createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("notifications");
  },
};

