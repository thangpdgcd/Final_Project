"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const payload = [
      {
        product_ID: 1,
        name: "Vietnamese Black Coffee",
        user_ID: 1,
        categories_ID: 1,
        description: "Strong iced black coffee brewed by phin filter",
        price: 25000,
        stock: 120,
        image:
          "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340894/20cc4c6c-0d74-4c8a-9840-b610ea917478.png",
        createdAt: now,
        updatedAt: now,
      },
      {
        product_ID: 2,
        name: "Vietnamese Milk Coffee",
        user_ID: 1,
        categories_ID: 1,
        description: "Classic milk coffee with condensed milk",
        price: 30000,
        stock: 100,
        image:
          "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340865/276204cb-0a4b-405c-9506-5f3d22de5b2e.png",
        createdAt: now,
        updatedAt: now,
      },
      {
        product_ID: 3,
        name: "Peach Tea",
        user_ID: 1,
        categories_ID: 2,
        description: "Peach tea with fruit slices",
        price: 40000,
        stock: 80,
        image:
          "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340916/b8d612ba-cde2-4f0d-975c-aa68855193e9.png",
        createdAt: now,
        updatedAt: now,
      },
      {
        product_ID: 4,
        name: "Butter Croissant",
        user_ID: 1,
        categories_ID: 3,
        description: "Baked buttery croissant",
        price: 35000,
        stock: 60,
        image:
          "https://res.cloudinary.com/dfjecxrnl/image/upload/v1774340948/46279eb4-1a7f-4a1f-997b-b1e01363c5ee.png",
        createdAt: now,
        updatedAt: now,
      },
    ];

    const ids = payload.map((p) => p.product_ID);
    const existing = await queryInterface.sequelize.query(
      `SELECT product_ID FROM Products WHERE product_ID IN (:ids)`,
      {
        replacements: { ids },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    const existingIds = new Set(existing.map((r) => r.product_ID));

    const toInsert = payload.filter((p) => !existingIds.has(p.product_ID));
    if (toInsert.length === 0) {
      console.log("✅ Products already exist - nothing to seed.");
      return;
    }

    await queryInterface.bulkInsert("Products", toInsert, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Products",
      {
        product_ID: [1, 2, 3, 4],
      },
      {}
    );
  },
};
