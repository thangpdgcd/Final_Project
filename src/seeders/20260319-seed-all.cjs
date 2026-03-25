"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Deprecated seed file kept to avoid duplicate inserts when running db:seed:all.
    // Use the dedicated seeders for Users, Categories, Products, and Orders.
  },

  async down(queryInterface, Sequelize) {
    // Intentionally empty.
  },
};

