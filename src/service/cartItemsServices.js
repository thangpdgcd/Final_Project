import db from "../models/index.js";
let { Cart_Items } = db;

let cartItemService = {
  getAllCartItems() {
    return new Promise(async (resolve, reject) => {
      try {
        const items = await Cart_Items.findAll(); // Không dùng include
        resolve(items);
      } catch (error) {
        reject(error);
      }
    });
  },

  cartItemsgetById(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const item = await Cart_Items.findByPk(id); // Không dùng include
        resolve(item);
      } catch (error) {
        reject(error);
      }
    });
  },

  deleteCartItems(id) {
    return new Promise(async (resolve, reject) => {
      try {
        const item = await Cart_Items.findByPk(id);
        if (item) {
          await item.destroy();
        }
        resolve(); // thành công dù không có item
      } catch (error) {
        reject(error);
      }
    });
  },

  updateCartItems(id, quantity) {
    return new Promise(async (resolve, reject) => {
      try {
        const item = await Cart_Items.findByPk(id);
        if (!item) {
          return reject(new Error("Not found"));
        }
        item.Quantity = quantity;
        await item.save();
        resolve(item);
      } catch (error) {
        reject(error);
      }
    });
  },
};

export default cartItemService;
