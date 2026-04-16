/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("conversation_participants", {
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
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      roleAtJoin: {
        type: Sequelize.STRING,
        allowNull: false,
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

    await queryInterface.addIndex("conversation_participants", ["conversationId"]);
    await queryInterface.addIndex("conversation_participants", ["userId"]);
    await queryInterface.addConstraint("conversation_participants", {
      fields: ["conversationId", "userId"],
      type: "unique",
      name: "uniq_conversation_participants_conversationId_userId",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("conversation_participants");
  },
};

