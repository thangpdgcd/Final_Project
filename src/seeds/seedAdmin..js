// src/seeds/seedAdmin.js
import bcrypt from "bcrypt";
import db from "../models/index.js"; // import toàn bộ models để lấy cả Users và sequelize
import dotenv from "dotenv";
dotenv.config();

const seedAdmin = async () => {
  try {
    await db.sequelize.sync(); // đảm bảo DB đã kết nối và bảng đã sẵn sàng

    const existingAdmin = await db.Users.findOne({
      where: { name: "admin" },
    });

    if (existingAdmin) {
      console.log("⚠️ Tài khoản admin đã tồn tại.");
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

    console.log("✅ Tạo tài khoản admin thành công.");
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin:", error);
  } finally {
    await db.sequelize.close(); // đóng kết nối sau khi chạy xong
  }
};

seedAdmin();
