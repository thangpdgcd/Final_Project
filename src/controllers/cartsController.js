// controllers/cartController.js
import cartService from "../service/cartsService.js"; // Đảm bảo đường dẫn đúng

let cartController = {
  // Lấy toàn bộ giỏ hàng
  async getAllCarts(req, res) {
    try {
      let { name } = req.query;
      if (name) {
        let result = await cartService.searchCart(name);
        return res.status(200).json(result); // nếu chỉ muốn API JSON
      }
      let cart = await cartService.getAllCarts();

      return res.status(200).json(cart); // nếu chỉ muốn API JSON
      // return res.render("products", { products }); // nếu dùng EJS
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Lấy giỏ hàng theo ID người dùng
  async getCartByUserId(req, res) {
    try {
      let { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      let cart = await cartService.getCartByUserId(userId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      return res.status(200).json(cart);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Thêm sản phẩm vào giỏ hàng
  async addToCart(req, res) {
    try {
      let { userId, productId, quantity, price } = req.body;
      if (!userId || !productId || !quantity || !price) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      let item = await cartService.addToCart(
        userId,
        productId,
        quantity,
        price
      );
      return res.status(201).json(item);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Cập nhật số lượng sản phẩm trong giỏ
  async updateCartItem(req, res) {
    try {
      let { cartItemId } = req.params;
      let { quantity } = req.body;

      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Invalid quantity" });
      }

      let updatedItem = await cartService.updateCartItemQuantity(
        cartItemId,
        quantity
      );
      return res.status(200).json(updatedItem);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },

  // Xoá sản phẩm khỏi giỏ
  async removeCartItem(req, res) {
    try {
      let { cartItemId } = req.params;
      await cartService.removeCartItem(cartItemId);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  },
};

export default cartController;
