"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "Cart_Items",
      [
        {
          cartitem_ID: 1,
          cart_ID: 1,
          product_ID: 1,
          quantity: 2,
          price: 25000,
          createdAt: now,
          updatedAt: now,
        },
        {
          cartitem_ID: 2,
          cart_ID: 1,
          product_ID: 3,
          quantity: 1,
          price: 40000,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Cart_Items",
      {
        cartitem_ID: [1, 2],
      },
      {}
    );
  },
};
