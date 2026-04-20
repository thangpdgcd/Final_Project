"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "Users";
    const desc = await queryInterface.describeTable(table);

    if (!desc.avatar) {
      await queryInterface.addColumn(table, "avatar", {
        type: Sequelize.STRING(1024),
        allowNull: true,
      });
    }

    if (!desc.provider) {
      await queryInterface.addColumn(table, "provider", {
        type: Sequelize.STRING(32),
        allowNull: true,
      });
      await queryInterface.addIndex(table, ["provider"]);
    }
  },

  async down(queryInterface, Sequelize) {
    const table = "Users";
    const desc = await queryInterface.describeTable(table);

    // Drop index first if it exists (best-effort, dialect-dependent).
    if (desc.provider) {
      try {
        await queryInterface.removeIndex(table, ["provider"]);
      } catch {
        // ignore
      }
      await queryInterface.removeColumn(table, "provider");
    }

    if (desc.avatar) {
      await queryInterface.removeColumn(table, "avatar");
    }
  },
};

