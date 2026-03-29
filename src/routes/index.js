import express from "express";
import db from "../models/index.js";
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

/** DB connectivity (503 if MySQL down or wrong host/port). */
router.get("/api/health", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.json({
      ok: true,
      database: "up",
      host: process.env.DB_HOST,
      name: process.env.DB_NAME,
    });
  } catch (e) {
    res.status(503).json({
      ok: false,
      database: "down",
      message: e?.message || "Database error",
      hint: "Start MySQL (e.g. `docker compose up -d` → DB_PORT=3307) or point DB_HOST/DB_PORT/DB_PASS at your real server. Access denied usually means wrong password or wrong port (local MySQL on 3306 vs Docker on 3307).",
    });
  }
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
