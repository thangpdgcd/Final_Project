"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "Orders",
      [
        {
          order_ID: 1,
          user_ID: 2,
          total_Amount: 70000,
          status: "Pending",
          shipping_Address: "Thu Duc, Ho Chi Minh City",
          createdAt: now,
          updatedAt: now,
        },
        {
          order_ID: 2,
          user_ID: 2,
          total_Amount: 105000,
          status: "Paid",
          shipping_Address: "Thu Duc, Ho Chi Minh City",
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Orders",
      {
        order_ID: [1, 2],
      },
      {}
    );
  },
};
