/* eslint-disable */
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // MySQL/TiDB: ENUM must be redefined to add a new value.
    await queryInterface.changeColumn("notifications", "type", {
      type: Sequelize.ENUM("order", "chat", "system", "voucher", "email"),
      allowNull: false,
      defaultValue: "system",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn("notifications", "type", {
      type: Sequelize.ENUM("order", "chat", "system", "voucher"),
      allowNull: false,
      defaultValue: "system",
    });
  },
};

