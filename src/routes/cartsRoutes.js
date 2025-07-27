// src/routes/cartRoutes.js
import express from "express";
import cartController from "../controllers/cartsController.js";

const router = express.Router();
// ✅ Lấy tất cả giỏ hàng (GET)
router.get("/carts", cartController.getAllCarts);
// ✅ Thêm sản phẩm vào giỏ (POST)
router.post("/add-to-cart", cartController.addToCart);

// ✅ Lấy giỏ hàng theo ID người dùng
router.get("/cart/user/:userId", cartController.getCartByUserId);

// ✅ Cập nhật số lượng sản phẩm trong giỏ (PUT)
router.put("/cart-items/:cartItemId", cartController.updateCartItem);

// ✅ Xoá sản phẩm khỏi giỏ (DELETE)
router.delete("/cart-items/:cartItemId", cartController.removeCartItem);

// Mount router vào app
const initCartRoutes = (app) => {
  app.use("/api", router); // Ví dụ: /api/add-to-cart
};

export default initCartRoutes;
