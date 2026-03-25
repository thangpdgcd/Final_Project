"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "Payments",
      [
        {
          payment_ID: 1,
          orderitem_ID: 1,
          payment_method: "paypal",
          payment_status: "completed",
          amount: 55000,
          paid: true,
          transaction_ID: "SEED_TX_001",
          createdAt: now,
          updatedAt: now,
        },
        {
          payment_ID: 2,
          orderitem_ID: 3,
          payment_method: "cod",
          payment_status: "pending",
          amount: 75000,
          paid: false,
          transaction_ID: "SEED_TX_002",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Payments",
      {
        payment_ID: [1, 2],
      },
      {}
    );
  },
};
