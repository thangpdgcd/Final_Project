"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const payload = [
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
    ];

    const ids = payload.map((p) => p.orderitem_ID);
    const existing = await queryInterface.sequelize.query(
      `SELECT orderitem_ID FROM Order_Items WHERE orderitem_ID IN (:ids)`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingIds = new Set(existing.map((r) => r.orderitem_ID));

    const toInsert = payload.filter((p) => !existingIds.has(p.orderitem_ID));
    if (toInsert.length === 0) {
      console.log("✅ Order_Items already exist - nothing to seed.");
      return;
    }

    await queryInterface.bulkInsert("Order_Items", toInsert, {});
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
