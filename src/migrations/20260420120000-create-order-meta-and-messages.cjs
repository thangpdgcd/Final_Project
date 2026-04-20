"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1) order_meta: note/staff assignment per order (1 row per order)
    await queryInterface.createTable("order_meta", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "Orders",
          key: "order_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      staffId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Users",
          key: "user_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("order_meta", ["orderId"], { unique: true });
    await queryInterface.addIndex("order_meta", ["staffId"]);

    // 2) order_messages: chat thread per order
    await queryInterface.createTable("order_messages", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      orderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Orders",
          key: "order_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_ID",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("order_messages", ["orderId"]);
    await queryInterface.addIndex("order_messages", ["senderId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("order_messages");
    await queryInterface.dropTable("order_meta");
  },
};

