// routes/homeRoutes.js
import express from "express";
import authMiddleware from "../middlewares/auth.js";
import { homePage } from "../controllers/homeController.js";

const router = express.Router();

router.get("/", authMiddleware, homePage);
const initHomeRoutes = (app) => {
  app.use("/", router); // Tất cả route đều bắt đầu bằng /api
};
export default initHomeRoutes;
