// src/seeds/seedAdmin.js
import bcrypt from "bcrypt";
import db from "../models/index.js";
import dotenv from "dotenv";
dotenv.config();

const seedAdmin = async () => {
  try {
    await db.sequelize.sync();

    const existingAdmin = await db.Users.findOne({
      where: { name: "admin" },
    });

    if (existingAdmin) {
      console.log("⚠️ Administrator account already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    await db.Users.create({
      name: "admin",
      password: hashedPassword,
      roleID: "2", // 2 for admin
      email: "admin@example.com",
      address: "123 Admin Street",
      phoneNumber: "0123456789",
    });

    console.log("✅ create admin successfully.");
  } catch (error) {
    console.error("❌ error create admin:", error);
  } finally {
    await db.sequelize.close(); // đóng kết nối sau khi chạy xong
  }
};

seedAdmin();
