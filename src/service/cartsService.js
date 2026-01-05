import db from "../models/index.js";
let { Carts, Cart_Items, Products } = db;

// Add product to cart
const addToCart = async (user_ID, product_ID, quantity, price) => {
  const uId = Number(user_ID);
  const pId = Number(product_ID);
  const qty = Number(quantity);
  const unitPrice = Number(price);

  if (!Number.isFinite(uId) || uId <= 0) {
    throw new Error("Invalid user_ID");
  }
  if (!Number.isFinite(pId) || pId <= 0) {
    throw new Error("Invalid product_ID");
  }
  if (!Number.isFinite(qty) || qty <= 0) {
    throw new Error("Invalid quantity");
  }
  if (!Number.isFinite(unitPrice) || unitPrice <= 0) {
    throw new Error("Invalid price");
  }

  let cart = await db.Carts.findOne({ where: { user_ID: uId } });
  if (!cart) {
    cart = await db.Carts.create({ user_ID: uId });
  }

  let cartItem = await db.Cart_Items.findOne({
    where: { cart_ID: cart.cart_ID, product_ID: pId },
  });

  if (cartItem) {
    const newQty = Number(cartItem.quantity) + qty;
    cartItem.quantity = newQty;
    cartItem.price = unitPrice * newQty;
    await cartItem.save();
  } else {
    cartItem = await db.Cart_Items.create({
      cart_ID: cart.cart_ID,
      product_ID: pId,
      quantity: qty,
      price: unitPrice * qty,
    });
  }

  return cartItem;
};
let getCartByUserId = (user_ID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!user_ID) return reject(new Error("User ID là bắt buộc"));

      const cart = await Carts.findOne({
        where: { user_ID },
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

let getCartItem = (cart_ID) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!cart_ID) return reject(new Error("Cart ID là bắt buộc"));

      let cart = await Carts.findOne({
        where: { cart_ID: cart_ID },
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

      // Trả về riêng mảng cart_Items nếu bạn chỉ muốn cart item
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
  getCartItem,
  addToCart,
  updateCart,
  removeCart,
  searchCart,
  getCartByUserId,
};
