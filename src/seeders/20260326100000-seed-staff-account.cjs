"use strict";

const bcrypt = require("bcrypt");

// Seeder: add staff account (roleID=3 by convention: user=1, admin=2, manager/staff=3)
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const email = "staff@example.com";
    const name = "Staff Account";

    // Avoid inserting duplicates (email is UNIQUE on Users)
    const existing = await queryInterface.sequelize.query(
      "SELECT email FROM Users WHERE email = :email LIMIT 1",
      {
        replacements: { email },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (existing && existing.length > 0) {
      console.log(`Staff account already exists: ${email}`);
      return;
    }

    const now = new Date();
    const hashedPassword = await bcrypt.hash("Staff@123", 10);

    await queryInterface.bulkInsert("Users", [
      {
        // user_ID is autoIncrement; omit it to let DB assign
        name,
        email,
        address: "Staff District, Ho Chi Minh City",
        phoneNumber: "0900000003",
        password: hashedPassword,
        roleID: "3",
        createdAt: now,
        updatedAt: now,
      },
    ]);

    console.log(`✅ Staff account seeded: ${email}`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Users",
      {
        email: ["staff@example.com"],
      },
      {}
    );
  },
};

