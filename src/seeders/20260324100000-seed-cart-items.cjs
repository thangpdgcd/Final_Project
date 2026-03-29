"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const payload = [
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
    ];

    const ids = payload.map((p) => p.cartitem_ID);
    const existing = await queryInterface.sequelize.query(
      `SELECT cartitem_ID FROM Cart_Items WHERE cartitem_ID IN (:ids)`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingIds = new Set(existing.map((r) => r.cartitem_ID));

    const toInsert = payload.filter((p) => !existingIds.has(p.cartitem_ID));
    if (toInsert.length === 0) {
      console.log("✅ Cart_Items already exist - nothing to seed.");
      return;
    }

    await queryInterface.bulkInsert("Cart_Items", toInsert, {});
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
