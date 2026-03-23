import db from "../models/index.js";
let { Carts, Cart_Items, Products } = db;

// Add product to cart
const addToCart = async (userId, productId, quantity, price) => {
  const uId = Number(userId);
  const pId = Number(productId);
  const qty = Number(quantity);
  const unitPrice = Number(price);

  if (!Number.isFinite(uId) || uId <= 0) {
    throw new Error("Invalid userId");
  }
  if (!Number.isFinite(pId) || pId <= 0) {
    throw new Error("Invalid productId");
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Invalid quantity");
  }
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    throw new Error("Invalid price");
  }

  let cart = await db.Carts.findOne({ where: { userId: uId } });
  if (!cart) {
    cart = await db.Carts.create({ userId: uId });
  }

  let cartItem = await db.Cart_Items.findOne({
    where: { cartId: cart.cartId, productId: pId },
  });

  if (cartItem) {
    const newQty = Number(cartItem.quantity) + qty;
    cartItem.quantity = newQty;
    cartItem.price = unitPrice * newQty;
    await cartItem.save();
  } else {
    cartItem = await db.Cart_Items.create({
      cartId: cart.cartId,
      productId: pId,
      quantity: qty,
      price: unitPrice * qty,
    });
  }

  return cartItem;
};
let getCartByUserId = (userId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userId) return reject(new Error("User ID là bắt buộc"));

      const cart = await Carts.findOne({
        where: { userId },
        include: [
          {
            model: Cart_Items,
            as: "cart_Items",
            include: [{ model: Products, as: "products" }],
          },
        ],
      });

      if (!cart) return resolve([]);
      resolve(cart.cart_Items || []);
    } catch (error) {
      reject(new Error("Không thể lấy giỏ hàng: " + error.message));
    }
  });
};

let getCartItem = (cartId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartId) return reject(new Error("Cart ID là bắt buộc"));

      let cart = await Carts.findOne({
        where: { cartId: cartId },
        include: [
          {
            model: Cart_Items,
            as: "cart_Items", // đúng alias như model
            include: [
              {
                model: Products,
                as: "products",
              },
            ],
          },
        ],
      });

      if (!cart) return resolve(null);

      // Trả về riêng mảng cartItems nếu bạn chỉ muốn cart item
      resolve(cart.cart_Items);
    } catch (error) {
      reject(new Error("Không thể lấy giỏ hàng: " + error.message));
    }
  });
};

let updateCart = (cartItemId, quantity) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartItemId || !quantity) {
        return reject(new Error("Thiếu cart item ID hoặc số lượng"));
      }

      let item = await Cart_Items.findByPk(cartItemId);
      if (!item) return reject(new Error("Cart Item không tồn tại"));

      item.quantity = quantity;
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
  getCartItem,
  addToCart,
  updateCart,
  removeCart,
  searchCart,
  getCartByUserId,
};
