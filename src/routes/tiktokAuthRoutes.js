import express from "express";
import { createTikTokAuthController } from "../controllers/tiktokAuth.controller.js";

export const buildTikTokAuthRouter = () => {
  const router = express.Router();
  const controller = createTikTokAuthController();

  router.get("/auth/tiktok", controller.redirectToTikTok);
  router.get("/auth/tiktok/callback", controller.handleTikTokCallback);

  return router;
};

const initTikTokAuthRoutes = (app) => {
  app.use("/", buildTikTokAuthRouter());
};

export default initTikTokAuthRoutes;

