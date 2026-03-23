// routes/homeRoutes.js
import express from "express";
import authMiddleware from "../middlewares/auth.js";

import { notfoundPage } from "../controllers/errornotfoundController.js";
const router = express.Router();

router.get("/notfound", authMiddleware, notfoundPage);
const initNotfoundRoutes = (app) => {
  app.use("/", router); // Tất cả route đều bắt đầu bằng /api
};
export default initNotfoundRoutes;  
