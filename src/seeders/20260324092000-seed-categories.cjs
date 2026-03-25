"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "Categories",
      [
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
      ],
      {}
    );
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
