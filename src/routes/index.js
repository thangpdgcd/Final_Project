import express from "express";
import initUserRoutes from "./usersRoutes.js";
import initProductsRoutes from "./productsRoutes.js";
import initCategoriesRoutes from "./categoriesRoutes.js";
import initOrdersRoutes from "./ordersRoutes.js";
import initCartRoutes from "./cartsRoutes.js";
import initAuthRoutes from "./authRoutes.js";
import initNotfoundRoutes from "./notfoundRoutes.js";
import initPaymentsRoutes from "./paymentsRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to API Root Route");
});

/**
 * Khởi tạo tất cả routes
 * Thứ tự quan trọng: route cụ thể trước, catch-all sau
 */
const initRoutes = (app) => {
  app.use("/", router);
  initUserRoutes(app);
  initProductsRoutes(app);
  initCategoriesRoutes(app);
  initOrdersRoutes(app);
  initCartRoutes(app);
  initAuthRoutes(app);
  initNotfoundRoutes(app);
  initPaymentsRoutes(app);
};

export default initRoutes;
