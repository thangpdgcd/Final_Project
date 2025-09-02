import db from "../models/index.js";
let { Carts, Cart_Items, Products } = db;

let getAllCarts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let carts = await Carts.findAll();
      resolve(carts);
    } catch (error) {
      reject(new Error("Không thể lấy danh sách giỏ hàng: " + error.message));
    }
  });
};

let createCartIfNotExists = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) return reject(new Error("User ID là bắt buộc"));

      let cart = await Carts.findOne({ where: { user_ID: userId } });
      if (!cart) {
        cart = await Carts.create({ user_ID: userId });
      }
      resolve(cart);
    } catch (error) {
      reject(new Error("Không thể tạo giỏ hàng: " + error.message));
    }
  });
};

let getCartByUserId = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) return reject(new Error("User ID là bắt buộc"));

      let cart = await Carts.findOne({
        where: { user_ID: userId },
        include: [
          {
            model: Cart_Items,
            as: "cart_items",
            include: [
              {
                model: Products,
                as: "products",
              },
            ],
          },
        ],
      });

      resolve(cart);
    } catch (error) {
      reject(new Error("Không thể lấy giỏ hàng: " + error.message));
    }
  });
};

let addToCart = (userId, productId, quantity, priceAtAdded) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId || !productId || !quantity || !priceAtAdded) {
        return reject(new Error("Thiếu tham số bắt buộc khi thêm vào giỏ"));
      }

      let cart = await createCartIfNotExists(userId);

      let [item, created] = await Cart_Items.findOrCreate({
        where: {
          cart_ID: cart.carts_ID,
          product_ID: productId,
        },
        defaults: {
          Quantity: quantity,
          Price_At_Added: priceAtAdded,
        },
      });

      if (!created) {
        item.Quantity += quantity;
        await item.save();
      }

      resolve(item);
    } catch (error) {
      reject(new Error("Không thể thêm sản phẩm vào giỏ: " + error.message));
    }
  });
};

let updateCartQuantity = (cartItemId, quantity) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartItemId || !quantity) {
        return reject(new Error("Thiếu cart item ID hoặc số lượng"));
      }

      let item = await Cart_Items.findByPk(cartItemId);
      if (!item) return reject(new Error("Cart Item không tồn tại"));

      item.Quantity = quantity;
      await item.save();
      resolve(item);
    } catch (error) {
      reject(new Error("Không thể cập nhật số lượng: " + error.message));
    }
  });
};

let removeCart = (cartItemId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartItemId) return reject(new Error("Thiếu cart item ID"));

      let item = await Cart_Items.findByPk(cartItemId);
      if (!item) return reject(new Error("Cart Item không tồn tại"));

      await item.destroy();
      resolve(true);
    } catch (error) {
      reject(new Error("Không thể xóa Cart Item: " + error.message));
    }
  });
};
let searchCart = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let cart = await Carts.findAll({
        where: {
          name: name,
        },
      });
      resolve(cart);
    } catch (error) {
      reject(new Error("Không thể tìm kiếm người dùng: " + error.message));
    }
  });
};
export default {
  getAllCarts,
  createCartIfNotExists,
  getCartByUserId,
  addToCart,
  updateCartQuantity,
  removeCart,
  searchCart,
};
