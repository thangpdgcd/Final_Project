/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("promo_vouchers", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(64),
        allowNull: false,
        unique: true,
      },
      discount_type: {
        type: Sequelize.ENUM("percentage", "fixed"),
        allowNull: false,
      },
      discount_value: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: false,
      },
      min_order_value: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true,
      },
      max_discount_value: {
        type: Sequelize.DECIMAL(18, 2),
        allowNull: true,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      used_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_by: {
        type: Sequelize.STRING(16),
        allowNull: false,
        defaultValue: "admin",
      },
      applicable_users: {
        type: Sequelize.ENUM("all", "new_user", "specific"),
        allowNull: false,
        defaultValue: "all",
      },
      specific_users: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      created_by_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "Users", key: "user_ID" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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

    await queryInterface.addIndex("promo_vouchers", ["code"], { unique: true });
    await queryInterface.addIndex("promo_vouchers", ["is_active"]);
    await queryInterface.addIndex("promo_vouchers", ["end_date"]);
    await queryInterface.addIndex("promo_vouchers", ["applicable_users"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("promo_vouchers");
  },
};

