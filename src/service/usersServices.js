import db from "../models/index.js";
let { Users, Orders } = db;
import bcrypt from "bcrypt";

const getAllUsers = async () => {
  try {
    const usersList = await Users.findAll({
      include: {
        model: Orders,
        as: "orders", // phải trùng alias khi khai báo quan hệ
        attributes: ["order_ID", "total_Amount", "status"],
      },
      attributes: ["user_ID", "name", "email", "address", "phoneNumber"], // lấy info user
    });
    return usersList;
  } catch (error) {
    throw new Error("Unable to retrieve user list: " + error.message);
  }
};

let getUsersById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await Users.findByPk(id);
      if (!user) return reject(new Error("User does not exist"));
      resolve(user);
    } catch (error) {
      reject(
        new Error("Unable to retrieve user information: " + error.message)
      );
    }
  });
};

let createAdmin = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { name, email, address, phoneNumber, password, roleID } = data;

      if (!name || !email || !password) {
        return reject(new Error("Missing required information"));
      }

      // ✅ ép roleID về number (mặc định Admin=2)
      const finalRoleID =
        roleID !== undefined && roleID !== null && String(roleID).trim() !== ""
          ? Number(roleID)
          : 2;

      // ✅ chặn role ngoài phạm vi bạn dùng
      const safeRoleID = [1, 2, 3].includes(finalRoleID) ? finalRoleID : 2;

      // ✅ check email unique là đủ
      const existingEmail = await Users.findOne({ where: { email } });
      if (existingEmail) return reject(new Error("Email already exists."));

      // ❌ KHÔNG nên check address unique (bỏ đi)
      // const existingAddress = await Users.findOne({ where: { address } });
      // if (existingAddress) return reject(new Error("Address already exists."));

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await Users.create({
        name,
        email,
        address: address || "",
        phoneNumber: phoneNumber || "",
        password: hashedPassword,
        roleID: safeRoleID, // ✅ number 1/2/3
        status: data.status || "active", // nếu có cột status
      });

      resolve(newUser);
    } catch (error) {
      reject(new Error("Unable to create user: " + error.message));
    }
  });
};

let updateUsers = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await Users.findByPk(id);
      if (!user) return reject(new Error("User does not exist"));
      await user.update(data);
      resolve(user);
    } catch (error) {
      reject(new Error("Unable to update user: " + error.message));
    }
  });
};

let deleteUsers = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await Users.findByPk(id);
      if (!user) return reject(new Error("User does not exist"));

      await user.destroy();
      resolve();
    } catch (error) {
      reject(new Error("Unable to delete user: " + error.message));
    }
  });
};

let searchUsers = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let users = await Users.findAll({
        where: {
          name: name,
        },
      });

      resolve(users);
    } catch (error) {
      reject(new Error("Unable to search user: " + error.message));
    }
  });
};

export default {
  getAllUsers,
  getUsersById,
  createAdmin,
  updateUsers,
  deleteUsers,
  searchUsers,
};
