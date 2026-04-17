/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("vouchers", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(32),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: {
        type: Sequelize.ENUM("fixed", "percent"),
        allowNull: false,
      },
      value: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      max_discount_value: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      created_by_staff_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      used_order_id: {
        type: Sequelize.STRING,
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

    await queryInterface.addIndex("vouchers", ["code"], { unique: true });
    await queryInterface.addIndex("vouchers", ["user_id"]);
    await queryInterface.addIndex("vouchers", ["expires_at"]);

    await queryInterface.createTable("voucher_audit_logs", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      voucher_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "vouchers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      action: {
        type: Sequelize.ENUM("create", "send", "redeem", "expire"),
        allowNull: false,
      },
      staff_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    await queryInterface.addIndex("voucher_audit_logs", ["voucher_id"]);
    await queryInterface.addIndex("voucher_audit_logs", ["user_id"]);
    await queryInterface.addIndex("voucher_audit_logs", ["staff_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("voucher_audit_logs");
    await queryInterface.dropTable("vouchers");
  },
};

