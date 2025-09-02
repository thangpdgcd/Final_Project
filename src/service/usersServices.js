import db from "../models/index.js";
let { Users } = db;
import bcrypt from "bcrypt";

let getAllUsers = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let usersList = await Users.findAll();
      resolve(usersList);
    } catch (error) {
      reject(new Error("Unable to retrieve user list: " + error.message));
    }
  });
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
    let { name, email, address, phoneNumber, password, roleID } = data;

    if (!email || !address || !password) {
      return reject(new Error("Missing required information"));
    }

    try {
      let existingEmail = await Users.findOne({ where: { email } });
      if (existingEmail) return reject(new Error("Email already exists."));

      let existingAddress = await Users.findOne({ where: { address } });
      if (existingAddress) return reject(new Error("Address already exists."));

      const hashedPassword = await bcrypt.hash(password, 10);

      let newUser = await Users.create({
        name,
        email,
        address,
        phoneNumber,
        password: hashedPassword,
        roleID: roleID || 3,
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
