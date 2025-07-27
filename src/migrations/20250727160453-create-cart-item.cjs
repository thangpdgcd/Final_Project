"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Cart_Items", {
      Cart_Item_ID: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      Cart_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Carts", // tên bảng Cart
          key: "Cart_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      Product_ID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Products", // tên bảng Product
          key: "Product_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      Quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Price_At_Added: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
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
    await queryInterface.dropTable("Cart_Items");
  },
};
