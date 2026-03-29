"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Seed a default detail row per seeded category.
    // - categories_ID is FK to Categories.categories_ID
    // - table has no timestamps
    const payload = [
      {
        categories_ID: 1,
        origin: "Vietnam",
        size: "250g",
        roastLevel: "Medium",
        processing: "Washed",
      },
      {
        categories_ID: 2,
        origin: "Taiwan",
        size: "500ml",
        roastLevel: null,
        processing: "Brewed",
      },
      {
        categories_ID: 3,
        origin: "France",
        size: "1 piece",
        roastLevel: null,
        processing: "Baked",
      },
    ];

    const ids = payload.map((p) => p.categories_ID);

    // Idempotent: only insert if that category doesn't already have a detail row.
    const existing = await queryInterface.sequelize.query(
      `SELECT categories_ID FROM category_details WHERE categories_ID IN (:ids)`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingIds = new Set(existing.map((r) => r.categories_ID));

    const toInsert = payload
      .filter((p) => !existingIds.has(p.categories_ID))
      .map((p) => ({
        origin: p.origin,
        size: p.size,
        roastLevel: p.roastLevel,
        processing: p.processing,
        categories_ID: p.categories_ID,
      }));

    if (toInsert.length === 0) {
      console.log("✅ category_details already exist - nothing to seed.");
      return;
    }

    await queryInterface.bulkInsert("category_details", toInsert, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "category_details",
      {
        categories_ID: [1, 2, 3],
      },
      {}
    );
  },
};

