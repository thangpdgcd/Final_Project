import db from "../models/index.js";

let { Carts, Cart_Items, Products } = db;

let cartService = {
  getAllCarts() {
    return new Promise(async (resolve, reject) => {
      try {
        const carts = await Carts.findAll();
        resolve(carts);
      } catch (error) {
        reject(error);
      }
    });
  },

  createCartIfNotExists(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userId) return reject(new Error("User ID is required"));

        let cart = await Carts.findOne({ where: { Users_ID: userId } });
        if (!cart) {
          cart = await Carts.create({ Users_ID: userId });
        }
        resolve(cart);
      } catch (error) {
        reject(error);
      }
    });
  },

  getCartByUserId(userId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userId) return reject(new Error("User ID is required"));

        const cart = await Carts.findOne({
          where: { Users_ID: userId },
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
        reject(error);
      }
    });
  },

  addToCart(userId, productId, quantity, priceAtAdded) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!userId || !productId || !quantity || !priceAtAdded) {
          return reject(
            new Error("Missing required parameters to add to cart")
          );
        }

        const cart = await this.createCartIfNotExists(userId);

        const [item, created] = await Cart_Items.findOrCreate({
          where: {
            Carts_ID: cart.Carts_ID,
            Products_ID: productId,
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
        reject(error);
      }
    });
  },

  updateCartItemQuantity(cartItemId, quantity) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!cartItemId || !quantity) {
          return reject(new Error("Missing cart item ID or quantity"));
        }

        const item = await Cart_Items.findByPk(cartItemId);
        if (!item) return reject(new Error("Cart item not found"));

        item.Quantity = quantity;
        await item.save();
        resolve(item);
      } catch (error) {
        reject(error);
      }
    });
  },

  removeCartItem(cartItemId) {
    return new Promise(async (resolve, reject) => {
      try {
        if (!cartItemId) return reject(new Error("Missing cart item ID"));

        const item = await Cart_Items.findByPk(cartItemId);
        if (!item) return reject(new Error("Cart item not found"));

        await item.destroy();
        resolve(true);
      } catch (error) {
        reject(error);
      }
    });
  },
};

export default cartService;
