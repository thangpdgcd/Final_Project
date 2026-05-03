/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("staff_emails", "content_locale", {
      type: Sequelize.STRING(8),
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("staff_emails", "content_locale");
  },
};
