import express from "express";
import cartController from "../controllers/cartsController.js";

const router = express.Router();

router.get("/carts", cartController.getCartByUserId);
router.post("/add-to-cart", cartController.addToCart);
router.put("/cart-items/:cartItemId", cartController.updateCart);
router.delete("/cart-items/:cartItemId", cartController.removeCart);

const initCartRoutes = (app) => {
  app.use("/api", router);
};

export default initCartRoutes;
