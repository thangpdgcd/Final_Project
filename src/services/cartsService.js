import db from "../models/index.js";

// Add product to cart
const addToCart = async (userId, productId, quantity, price) => {
  const uId = Number(userId);
  const pId = Number(productId);
  const qty = Number(quantity);
  let unitPrice = price == null ? null : Number(price);

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
    const product = await db.Products.findByPk(pId);
    if (!product) throw new Error("Product not found");
    unitPrice = Number(product.price);
    if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
      throw new Error("Invalid product price");
    }
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

/**
 * Two-step load avoids fragile nested includes (some MySQL/Sequelize combos error on deep joins).
 */
const getCartByUserId = async (userId) => {
  const uid = Number(userId);
  if (!Number.isFinite(uid) || uid <= 0) {
    throw new Error("User ID is required");
  }

  const cart = await db.Carts.findOne({ where: { userId: uid } });
  if (!cart) return [];

  return db.Cart_Items.findAll({
    where: { cartId: cart.cartId },
    include: [{ model: db.Products, as: "products", required: false }],
    order: [["cartItemId", "ASC"]],
  });
};

const getCartItem = (cartId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartId) return reject(new Error("Cart ID is required"));

      const cart = await db.Carts.findOne({
        where: { cartId: cartId },
      });
      if (!cart) return resolve(null);

      const rows = await db.Cart_Items.findAll({
        where: { cartId: cart.cartId },
        include: [{ model: db.Products, as: "products", required: false }],
        order: [["cartItemId", "ASC"]],
      });

      resolve(rows);
    } catch (error) {
      reject(new Error("Could not load cart: " + error.message));
    }
  });
};

const updateCart = (cartItemId, quantity) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartItemId || !quantity) {
        return reject(new Error("Missing cart item ID or quantity"));
      }

      const item = await db.Cart_Items.findByPk(cartItemId);
      if (!item) return reject(new Error("Cart item does not exist"));

      item.quantity = quantity;
      await item.save();
      resolve(item);
    } catch (error) {
      reject(new Error("Could not update quantity: " + error.message));
    }
  });
};

const removeCart = (cartItemId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cartItemId) return reject(new Error("Missing cart item ID"));

      const item = await db.Cart_Items.findByPk(cartItemId);
      if (!item) return reject(new Error("Cart item does not exist"));

      await item.destroy();
      resolve(true);
    } catch (error) {
      reject(new Error("Could not delete cart item: " + error.message));
    }
  });
};

const searchCart = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cart = await db.Carts.findAll({
        where: {
          name: name,
        },
      });
      resolve(cart);
    } catch (error) {
      reject(new Error("Cart search failed: " + error.message));
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
