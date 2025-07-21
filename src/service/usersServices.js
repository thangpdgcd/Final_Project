import db from "../models/index.js";
let { Users } = db;

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
    let { Name, Email, Address, PhoneNumber } = data;

    if (!Email || !Address) {
      return reject(new Error("Thiếu thông tin bắt buộc"));
    }

    try {
      let existingEmail = await Users.findOne({
        where: { Email },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (existingEmail) return reject(new Error("Email đã tồn tại."));

      let existingAddress = await Users.findOne({
        where: { Address },
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      if (existingAddress) return reject(new Error("Địa chỉ đã tồn tại."));

      let newUser = await Users.create({ Name, Email, Address, PhoneNumber });
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

export default {
  getAllUsers,
  getUsersById,
  createUsers,
  updateUsers,
  deleteUsers,
};
