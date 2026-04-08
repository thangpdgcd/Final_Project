"use strict";

const bcrypt = require("bcrypt");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9+]{9,15}$/;
const allowedRoles = ["1", "2", "3"];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const accounts = [
        {
          name: "Admin Account",
          email: "admin@example.com",
          address: "District 1, Ho Chi Minh City",
          phoneNumber: "0900000001",
          password: "123456",
          roleID: "2",
      },
        {
        name: "Staff Account",
        email: "staff@example.com",
        address: "Thu Duc, Ho Chi Minh City",
        phoneNumber: "0900000002",
        password: "123456",
        roleID: "3",
      },
      {
        name: "User Account",
        email: "user@example.com",
        address: "Thu Duc, Ho Chi Minh City",
        phoneNumber: "0900000002",
        password: "123456",
        roleID: "1",
      },
    ];

    const seenEmails = new Set();
    for (const account of accounts) {
      if (!account.name || account.name.length < 2 || account.name.length > 50) {
        throw new Error(
          `Invalid name for ${account.email || "unknown email"}: must be 2-50 chars.`
        );
      }
      if (!account.email || !emailRegex.test(account.email)) {
        throw new Error(`Invalid email format: ${account.email || "empty email"}`);
      }
      if (!account.password || account.password.length < 6) {
        throw new Error(
          `Invalid password for ${account.email}: must be at least 6 chars.`
        );
      }
      if (account.phoneNumber && !phoneRegex.test(account.phoneNumber)) {
        throw new Error(`Invalid phone number for ${account.email}.`);
      }
      if (!allowedRoles.includes(String(account.roleID))) {
        throw new Error(
          `Invalid roleID for ${account.email}: allowed ${allowedRoles.join(", ")}.`
        );
      }
      if (seenEmails.has(account.email)) {
        throw new Error(`Duplicate email in seeder payload: ${account.email}`);
      }
      seenEmails.add(account.email);
    }

    // Idempotent insert: only insert records that don't exist yet (email is UNIQUE).
    const seededUsers = [];
    for (const account of accounts) {
      const existing = await queryInterface.sequelize.query(
        "SELECT email FROM Users WHERE email = :email LIMIT 1",
        {
          replacements: { email: account.email },
          type: Sequelize.QueryTypes.SELECT,
        }
      );

      if (existing && existing.length > 0) {
        console.log(`Skip existing user: ${account.email}`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(account.password, 10);
      seededUsers.push({
        // Let DB auto-increment user_ID
        name: account.name,
        email: account.email,
        address: account.address,
        phoneNumber: account.phoneNumber,
        password: hashedPassword,
        roleID: String(account.roleID),
        createdAt: now,
        updatedAt: now,
      });
    }

    if (seededUsers.length > 0) {
      await queryInterface.bulkInsert("Users", seededUsers, {});
    } else {
      console.log("✅ Admin/User already exist - nothing to seed.");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "Users",
      {
        email: ["admin@example.com", "user@example.com"],
      },
      {}
    );
  },
};
