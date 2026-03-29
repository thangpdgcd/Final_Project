"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const payload = [
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
    ];

    const ids = payload.map((p) => p.order_ID);
    const existing = await queryInterface.sequelize.query(
      `SELECT order_ID FROM Orders WHERE order_ID IN (:ids)`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingIds = new Set(existing.map((r) => r.order_ID));

    const toInsert = payload.filter((p) => !existingIds.has(p.order_ID));
    if (toInsert.length === 0) {
      console.log("✅ Orders already exist - nothing to seed.");
      return;
    }

    await queryInterface.bulkInsert("Orders", toInsert, {});
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
