/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("staff_emails", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      toUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "to_user_id",
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      fromStaffId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: "from_staff_id",
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      toEmail: {
        type: Sequelize.STRING,
        allowNull: false,
        field: "to_email",
      },
      subject: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: "read_at",
      },
      status: {
        type: Sequelize.ENUM("queued", "sent", "failed"),
        allowNull: false,
        defaultValue: "sent",
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

    await queryInterface.addIndex("staff_emails", ["to_user_id"]);
    await queryInterface.addIndex("staff_emails", ["to_user_id", "read_at"]);
    await queryInterface.addIndex("staff_emails", ["createdAt"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("staff_emails");
  },
};

