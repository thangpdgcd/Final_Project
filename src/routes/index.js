import express from "express";
import db from "../models/index.js";
import { sendSuccess, sendError } from "../utils/response.js";
import initUserRoutes from "./usersRoutes.js";
import initProductsRoutes from "./productsRoutes.js";
import initCategoriesRoutes from "./categoriesRoutes.js";
import initOrdersRoutes from "./ordersRoutes.js";
import initCartRoutes from "./cartsRoutes.js";
import initAuthRoutes from "./authRoutes.js";
import initTikTokAuthRoutes from "./tiktokAuthRoutes.js";
import initPaymentsRoutes from "./paymentsRoutes.js";
import initChatRoutes from "./chatRoutes.js";
import initPresenceRoutes from "./presenceRoutes.js";
import initVoucherAdminRoutes from "./voucherAdminRoutes.js";
import { initAdminVoucherRoutes } from "./adminVoucherRoutes.js";
import { initVoucherRoutes } from "./voucherRoutes.js";
import initNotificationsRoutes from "./notificationsRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to API Root Route");
});

/** DB connectivity (503 if MySQL down or wrong host/port). */
router.get("/api/health", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    return sendSuccess(
      res,
      200,
      {
        database: "up",
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
      },
      "OK",
    );
  } catch (e) {
    return sendError(
      res,
      503,
      e?.message || "Database error",
      {
        database: "down",
        hint: "Start MySQL or set DB_HOST/DB_PORT/DB_PASS. Access denied often means wrong password or port.",
      },
    );
  }
});

/**
 * Mount route modules (specific routes before any catch-all).
 */
const initRoutes = (app) => {
  app.use("/", router);
  // OAuth login flows (public, no /api prefix)
  initTikTokAuthRoutes(app);
  // Auth before user/staff routes so `GET /api/users/me` matches the current-user handler,
  // not `GET /api/users/:id` (staff) with id "me".
  initAuthRoutes(app);
  // Presence routes must register before staff `GET /api/users/:id`, otherwise `online`/`basic`
  // are captured as :id and return 404.
  initPresenceRoutes(app);
  initUserRoutes(app);
  initProductsRoutes(app);
  initCategoriesRoutes(app);
  initOrdersRoutes(app);
  initCartRoutes(app);
  initChatRoutes(app);
  initNotificationsRoutes(app);
  initVoucherAdminRoutes(app);
  initAdminVoucherRoutes(app);
  initVoucherRoutes(app);
  initPaymentsRoutes(app);
};

export default initRoutes;
