import cartService from "../services/cartsService.js";
import { sendSuccess, sendError } from "../utils/response.js";

const getCartItem = async (req, res) => {
  try {
    const { cartId } = req.params;
    if (!cartId) {
      return sendError(res, 400, "Cart ID is required", null);
    }

    const cartItems = await cartService.getCartItem(cartId);
    if (!cartItems) {
      return sendError(res, 404, "Cart not found", null);
    }

    return sendSuccess(res, 200, cartItems, "OK");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.body.productId ?? req.body.product_ID;
    const { quantity, price } = req.body;
    if (!productId || !quantity) {
      return sendError(
        res,
        400,
        "Missing required fields (productId, quantity)",
        null,
      );
    }

    const cart = await cartService.addToCart(
      userId,
      productId,
      quantity,
      price,
    );

    return sendSuccess(res, 201, { cart }, "Product added to cart");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const updateCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return sendError(res, 400, "Invalid quantity", null);
    }

    const updatedItem = await cartService.updateCart(cartItemId, quantity);
    return sendSuccess(res, 200, { item: updatedItem }, "Quantity updated");
  } catch (error) {
    return sendError(res, 500, error.message, null);
  }
};

const getCartByUserId = async (req, res) => {
  try {
    const userId = req.user?.id ?? req.user?.userId;
    if (userId == null || !Number.isFinite(Number(userId))) {
      return sendError(res, 401, "User id missing from token", null);
    }
    const items = await cartService.getCartByUserId(Number(userId));
    return sendSuccess(res, 200, items, "OK");
  } catch (e) {
    return sendError(res, 500, e.message, null);
  }
};

const removeCart = async (req, res) => {
  try {
    const { cartItemId } = req.params;
    await cartService.removeCart(cartItemId);
    return sendSuccess(res, 200, null, "Cart item removed");
  } catch (error) {
    const msg = error?.message || "Failed to remove cart item";
    if (msg.toLowerCase().includes("not exist") || msg.includes("does not exist")) {
      return sendError(res, 404, msg, null);
    }
    if (msg.toLowerCase().includes("missing") || msg.toLowerCase().includes("required")) {
      return sendError(res, 400, msg, null);
    }
    return sendError(res, 500, msg, null);
  }
};

export default {
  getCartItem,
  addToCart,
  updateCart,
  removeCart,
  getCartByUserId,
};
