"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addConstraint("Products", {
      fields: ["user_ID"],
      type: "foreign key",
      name: "fk_products_user_id_users",
      references: {
        table: "Users",
        field: "user_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("Products", {
      fields: ["categories_ID"],
      type: "foreign key",
      name: "fk_products_categories_id_categories",
      references: {
        table: "Categories",
        field: "categories_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("Orders", {
      fields: ["user_ID"],
      type: "foreign key",
      name: "fk_orders_user_id_users",
      references: {
        table: "Users",
        field: "user_ID",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint("Orders", "fk_orders_user_id_users");
    await queryInterface.removeConstraint(
      "Products",
      "fk_products_categories_id_categories"
    );
    await queryInterface.removeConstraint("Products", "fk_products_user_id_users");
  },
};
