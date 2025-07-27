import express from "express";
import cartItemsController from "../controllers/cartItemsController.js";

const router = express.Router();

// ✅ Lấy tất cả cart items: GET /api/cart-items
router.get("/cart-items", cartItemsController.getAllCartItems);

// ✅ Lấy 1 cart item theo ID: GET /api/cart-items/:id
router.get("/cart-items/:id", cartItemsController.getCartItemById);

// ✅ Cập nhật số lượng: PUT /api/cart-items/:id
router.put("/cart-items/:id", cartItemsController.updateCartItem);

// ✅ Xoá cart item: DELETE /api/cart-items/:id
router.delete("/cart-items/:id", cartItemsController.deleteCartItem);

// Gắn vào app
const initCartItemRoutes = (app) => {
  app.use("/api", router); // Tất cả route đều bắt đầu bằng /api
};

export default initCartItemRoutes;
