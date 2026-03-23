import cartService from "../service/cartsService.js";

let getCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    if (!cartId) {
      return res.status(400).json({ message: "Cart ID is required" });
    }

    const cartItems = await cartService.getCartItem(cartId);
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
    const userId = req.user.id; // Lấy từ token - bảo mật hơn
    const productId = req.body.productId ?? req.body.product_ID;
    const { quantity, price } = req.body;
    if (!productId || !quantity || price == null) {
      return res.status(400).json({ message: "Missing required fields (productId, quantity, price)" });
    }

    const cart = await cartService.addToCart(
      userId,
      productId,
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
    const userId = req.user.id; // Lấy từ token (đã verify bởi authMiddleware)
    const items = await cartService.getCartByUserId(userId);
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
