"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    await queryInterface.bulkInsert(
      "Products",
      [
        {
          product_ID: 1,
          name: "Vietnamese Black Coffee",
          user_ID: 1,
          categories_ID: 1,
          description: "Strong iced black coffee brewed by phin filter",
          price: 25000,
          stock: 120,
          image: null,
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
          image: null,
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
          image: null,
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
          image: null,
          createdAt: now,
          updatedAt: now,
        },
      ],
      {}
    );
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
