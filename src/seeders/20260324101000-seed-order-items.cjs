"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "Order_Items",
      [
        {
          orderitem_ID: 1,
          order_ID: 1,
          product_ID: 1,
          quantity: 1,
          price: 25000,
          createdAt: now,
          updatedAt: now,
        },
        {
          orderitem_ID: 2,
          order_ID: 1,
          product_ID: 2,
          quantity: 1,
          price: 30000,
          createdAt: now,
          updatedAt: now,
        },
        {
          orderitem_ID: 3,
          order_ID: 2,
          product_ID: 3,
          quantity: 1,
          price: 40000,
          createdAt: now,
          updatedAt: now,
        },
        {
          orderitem_ID: 4,
          order_ID: 2,
          product_ID: 4,
          quantity: 1,
          price: 35000,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Order_Items",
      {
        orderitem_ID: [1, 2, 3, 4],
      },
      {}
    );
  },
};
