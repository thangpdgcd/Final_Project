import cartService from "../service/cartsService.js";

let getCartItem = async (req, res) => {
  try {
    const { cart_ID } = req.params;
    if (!cart_ID) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    const cartItems = await cartService.getCartItem(cart_ID);
    if (!cartItems) {
      return res.status(404).json({ message: "Cart not found" });
    }

    return res.status(200).json(cartItems);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
let addToCart = async (req, res) => {
  try {
    const { user_ID, product_ID, quantity, price } = req.body;
    if (!user_ID || !product_ID || !quantity || !price) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const cart = await cartService.addToCart(
      user_ID,
      product_ID,
      quantity,
      price,
    );

    return res.status(201).json({
      message: "Thêm sản phẩm vào giỏ hàng thành công",
      data: cart,
    });
  } catch (error) {
    return res.status(500).json({
      message: `Không thể thêm sản phẩm: ${error.message}`,
    });
  }
};

let updateCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const updatedItem = await cartService.updateCart(cartItemId, quantity);
    return res.status(200).json({
      message: "Cập nhật số lượng thành công",
      data: updatedItem,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let getCartByUserId = async (req, res) => {
  try {
    const user_ID = Number(req.query.user_ID);
    if (!Number.isFinite(user_ID) || user_ID <= 0) {
      return res.status(400).json({ message: "user_ID không hợp lệ" });
    }

    const items = await cartService.getCartByUserId(user_ID);
    return res.status(200).json(items);
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

let removeCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    await cartService.removeCart(cartItemId);
    return res
      .status(200)
      .json({ message: "Xoá sản phẩm khỏi giỏ hàng thành công" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export default {
  getCartItem,
  addToCart,
  updateCart,
  removeCart,
  getCartByUserId,
};
