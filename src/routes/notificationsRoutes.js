import express from "express";
import authMiddleware from "../middlewares/auth.js";

import { createNotificationService } from "../services/notification.service.js";
import { createNotificationController } from "../controllers/notification.controller.js";
import { notfoundPage } from "../controllers/errornotfoundController.js";

const buildRouter = () => {
  const router = express.Router();

  const notificationService = createNotificationService();
  const notificationController = createNotificationController({ notificationService });

  router.get("/notifications", authMiddleware, notificationController.getMyNotifications);
  router.patch("/notifications/:id/read", authMiddleware, notificationController.markRead);
  router.patch("/notifications/read-all", authMiddleware, notificationController.markAllRead);

  router.get("/notfound", authMiddleware, notfoundPage);

  return router;
};

const router = buildRouter();

const initNotificationsRoutes = (app) => {
  // Notifications live under /api/*
  app.use("/api", router);

  // Keep existing /notfound route under root
  app.use("/", router);
};

export default initNotificationsRoutes;

