import db from "../models/index.js";
const { Users, Orders } = db;
import bcrypt from "bcrypt";

const getAllUsers = async () => {
  try {
    const usersList = await Users.findAll({
      include: {
        model: Orders,
        as: "orders",
        attributes: ["orderId", "total_Amount", "status"],
      },
      attributes: ["userId", "name", "email", "address", "phoneNumber"],
    });
    return usersList;
  } catch (error) {
    throw new Error("Unable to retrieve user list: " + error.message);
  }
};

const getUsersById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await Users.findByPk(id);
      if (!user) return reject(new Error("User does not exist"));
      resolve(user);
    } catch (error) {
      reject(
        new Error("Unable to retrieve user information: " + error.message),
      );
    }
  });
};

const createAdmin = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { name, email, address, phoneNumber, password, roleID } = data;

      if (!name || !email || !password) {
        return reject(new Error("Missing required information"));
      }

      const finalRoleID =
        roleID !== undefined && roleID !== null && String(roleID).trim() !== ""
          ? Number(roleID)
          : 2;

      const safeRoleID = [1, 2, 3].includes(finalRoleID) ? finalRoleID : 2;

      const existingEmail = await Users.findOne({ where: { email } });
      if (existingEmail) return reject(new Error("Email already exists."));

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await Users.create({
        name,
        email,
        address: address || "",
        phoneNumber: phoneNumber || "",
        password: hashedPassword,
        roleID: safeRoleID,
        status: data.status || "active",
      });

      resolve(newUser);
    } catch (error) {
      reject(new Error("Unable to create user: " + error.message));
    }
  });
};

const updateUsers = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await Users.findByPk(id);
      if (!user) return reject(new Error("User does not exist"));
      await user.update(data);
      resolve(user);
    } catch (error) {
      reject(new Error("Unable to update user: " + error.message));
    }
  });
};

const deleteUsers = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await Users.findByPk(id);
      if (!user) return reject(new Error("User does not exist"));

      await user.destroy();
      resolve();
    } catch (error) {
      reject(new Error("Unable to delete user: " + error.message));
    }
  });
};

const searchUsers = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const users = await Users.findAll({
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
