import db from "../models/index.js";
let { Users } = db;
import bcrypt from "bcrypt";
// Lấy tất cả người dùng
let getAllUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let usersList = await Users.findAll();
      resolve(usersList);
    } catch (error) {
      reject(new Error("Không thể lấy danh sách người dùng: " + error.message));
    }
  });
};

// Lấy 1 người dùng theo ID
let getUsersById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await Users.findByPk(id);
      if (!user) return reject(new Error("Người dùng không tồn tại"));
      resolve(user);
    } catch (error) {
      reject(new Error("Không thể lấy thông tin người dùng: " + error.message));
    }
  });
};

// Tạo người dùng mới
let createUsers = (data) => {
  return new Promise(async (resolve, reject) => {
    let { name, email, address, phoneNumber, password } = data;

    if (!email || !address || !password) {
      return reject(new Error("Thiếu thông tin bắt buộc"));
    }

    try {
      let existingEmail = await Users.findOne({ where: { email } });
      if (existingEmail) return reject(new Error("Email đã tồn tại."));

      let existingAddress = await Users.findOne({ where: { address } });
      if (existingAddress) return reject(new Error("Địa chỉ đã tồn tại."));

      // Mã hoá password
      const hashedPassword = await bcrypt.hash(password, 10);

      let newUser = await Users.create({
        name,
        email,
        address,
        phoneNumber,
        password: hashedPassword,
        roleID,
      });

      resolve(newUser);
    } catch (error) {
      reject(new Error("Không thể tạo người dùng: " + error.message));
    }
  });
};

// Cập nhật người dùng
let updateUsers = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await Users.findByPk(id);
      if (!user) return reject(new Error("Người dùng không tồn tại"));

      await user.update(data);
      resolve(user);
    } catch (error) {
      reject(new Error("Không thể cập nhật người dùng: " + error.message));
    }
  });
};

// Xoá người dùng
let deleteUsers = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await Users.findByPk(id);
      if (!user) return reject(new Error("Người dùng không tồn tại"));

      await user.destroy();
      resolve(); // hoặc resolve({ message: "Xoá thành công" })
    } catch (error) {
      reject(new Error("Không thể xoá người dùng: " + error.message));
    }
  });
};
let searchUsers = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await Users.findAll({
        where: {
          name: name,
        }, // so sánh chính xác
      });

      resolve(users);
    } catch (error) {
      reject(new Error("Không thể tìm kiếm người dùng: " + error.message));
    }
  });
};

export default {
  getAllUsers,
  getUsersById,
  createUsers,
  updateUsers,
  deleteUsers,
  searchUsers,
};
