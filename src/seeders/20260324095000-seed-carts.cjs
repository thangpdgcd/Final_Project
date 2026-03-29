"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const payload = [
      {
        cart_ID: 1,
        user_ID: 2,
        createdAt: now,
        updatedAt: now,
      },
    ];

    const ids = payload.map((p) => p.cart_ID);
    const existing = await queryInterface.sequelize.query(
      `SELECT cart_ID FROM Carts WHERE cart_ID IN (:ids)`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingIds = new Set(existing.map((r) => r.cart_ID));

    const toInsert = payload.filter((p) => !existingIds.has(p.cart_ID));
    if (toInsert.length === 0) {
      console.log("✅ Carts already exist - nothing to seed.");
      return;
    }

    await queryInterface.bulkInsert("Carts", toInsert, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Carts",
      {
        cart_ID: [1],
      },
      {}
    );
  },
};
