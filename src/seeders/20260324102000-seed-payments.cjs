"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const payload = [
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
    ];

    const ids = payload.map((p) => p.payment_ID);
    const existing = await queryInterface.sequelize.query(
      `SELECT payment_ID FROM Payments WHERE payment_ID IN (:ids)`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingIds = new Set(existing.map((r) => r.payment_ID));

    const toInsert = payload.filter((p) => !existingIds.has(p.payment_ID));
    if (toInsert.length === 0) {
      console.log("✅ Payments already exist - nothing to seed.");
      return;
    }

    await queryInterface.bulkInsert("Payments", toInsert, {});
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
