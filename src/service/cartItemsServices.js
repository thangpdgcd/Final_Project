import db from "../models/index.js";
let { Cart_Items } = db;

// Lấy tất cả Cart Items
let getAllCartItems = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let items = await Cart_Items.findAll();
      resolve(items);
    } catch (error) {
      reject(
        new Error(" CartItem can't get list cart exist: " + error.message)
      );
    }
  });
};

// Lấy 1 Cart Item theo ID
let getCartItemById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let item = await Cart_Items.findByPk(id);
      if (!item) return reject(new Error("Cart Item can't exist"));
      resolve(item);
    } catch (error) {
      reject(new Error("can't get Cart Item: " + error.message));
    }
  });
};

// Tạo mới Cart Item
let createCartItem = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { Product_ID, User_ID, Quantity } = data;

      if (!Product_ID || !User_ID || !Quantity) {
        return reject(new Error("Missing required information"));
      }

      let newItem = await Cart_Items.create({
        Product_ID,
        User_ID,
        Quantity,
      });

      resolve(newItem);
    } catch (error) {
      reject(new Error("can't create Cart Item: " + error.message));
    }
  });
};

// Cập nhật Cart Item
let updateCartItem = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let item = await Cart_Items.findByPk(id);
      if (!item) return reject(new Error("Cart Item Missing"));

      await item.update(data);
      resolve(item);
    } catch (error) {
      reject(new Error("can't update Cart Item: " + error.message));
    }
  });
};

// Xoá Cart Item
let deleteCartItem = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let item = await Cart_Items.findByPk(id);
      if (!item) return reject(new Error("Cart Item can't exist"));

      await item.destroy();
      resolve(); // hoặc resolve({ message: "Xoá thành công" })
    } catch (error) {
      reject(new Error("can't delete Cart Item: " + error.message));
    }
  });
};
// Tìm kiếm Cart Item theo name
let searchCartItems = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let items = await Cart_Items.findAll({
        where: {
          name: name, // so sánh chính xác
        },
      });

      resolve(items);
    } catch (error) {
      reject(new Error("can't find Cart Items: " + error.message));
    }
  });
};

export default {
  getAllCartItems,
  getCartItemById,
  createCartItem,
  updateCartItem,
  deleteCartItem,
  searchCartItems,
};
