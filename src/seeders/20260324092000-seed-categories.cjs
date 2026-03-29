"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const payload = [
      {
        categories_ID: 1,
        name: "Coffee",
        description: "Traditional and espresso coffee drinks",
        createdAt: now,
        updatedAt: now,
      },
      {
        categories_ID: 2,
        name: "Tea",
        description: "Fruit tea and milk tea drinks",
        createdAt: now,
        updatedAt: now,
      },
      {
        categories_ID: 3,
        name: "Bakery",
        description: "Pastries and sweet snacks",
        createdAt: now,
        updatedAt: now,
      },
    ];

    const ids = payload.map((p) => p.categories_ID);
    const existing = await queryInterface.sequelize.query(
      `SELECT categories_ID FROM Categories WHERE categories_ID IN (:ids)`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingIds = new Set(existing.map((r) => r.categories_ID));

    const toInsert = payload.filter((p) => !existingIds.has(p.categories_ID));
    if (toInsert.length === 0) {
      console.log("✅ Categories already exist - nothing to seed.");
      return;
    }

    await queryInterface.bulkInsert("Categories", toInsert, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Categories",
      {
        categories_ID: [1, 2, 3],
      },
      {}
    );
  },
};
