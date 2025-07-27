import cartItemService from "../service/cartItemsServices.js";
let cartItemsController = {
  // GET /api/cart-items
  async getAllCartItems(req, res) {
    try {
      const cartItems = await cartItemService.getAllCartItems();
      return res.render("cartItems", {
        cartItems, // ✅ Đảm bảo bạn truyền biến này vào view
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve cart items",
        error: error.message,
      });
    }
  },

  // GET /api/cart-items/:id
  async getCartItemById(req, res) {
    try {
      const id = req.params.id;
      const item = await cartItemService.cartItemsgetById(id);
      if (!item) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.status(200).json(item);
    } catch (error) {
      res.status(500).json({
        message: "Failed to retrieve cart item",
        error: error.message,
      });
    }
  },

  // DELETE /api/cart-items/:id
  async deleteCartItem(req, res) {
    try {
      const id = req.params.id;
      await cartItemService.deleteCartItems(id);
      res.status(200).json({ message: "Cart item deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to delete cart item", error: error.message });
    }
  },

  // PUT /api/cart-items/:id
  async updateCartItem(req, res) {
    try {
      const id = req.params.id;
      const { quantity } = req.body;
      if (quantity == null || quantity < 0) {
        return res
          .status(400)
          .json({ message: "Quantity must be a non-negative number" });
      }

      const updatedItem = await cartItemService.updateCartItems(id, quantity);
      res.status(200).json(updatedItem);
    } catch (error) {
      res
        .status(500)
        .json({ message: "Failed to update cart item", error: error.message });
    }
  },
};

export default cartItemsController;
