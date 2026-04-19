import express from "express";
import authMiddleware from "../middlewares/auth.js";
import uploadCloud from "../config/uploadConfig.js";
import { sendError } from "../utils/response.js";
import { createUserRepository } from "../services/user.repository.js";
import { createUserService } from "../services/user.service.js";
import { createUserController } from "../controllers/user.controller.js";

export const buildUserRouter = () => {
  const router = express.Router();

  const userRepository = createUserRepository();
  const userService = createUserService({ userRepository });
  const userController = createUserController({ userService });
  const uploadAvatar = (req, res, next) => {
    uploadCloud.single("file")(req, res, (err) => {
      if (!err) return next();
      const message =
        err?.message ||
        err?.error?.message ||
        "Avatar upload failed";
      const status = Number(err?.http_code || err?.statusCode || err?.status) || 400;
      return sendError(res, status, message, null);
    });
  };

  router.put("/profile", authMiddleware, userController.updateProfile);
  router.post(
    "/upload-avatar",
    authMiddleware,
    uploadAvatar,
    userController.uploadAvatar,
  );
  router.get("/wallet", authMiddleware, userController.getWallet);
  router.get(
    "/wallet/transactions",
    authMiddleware,
    userController.getWalletTransactions,
  );
  router.post("/wallet/topup", authMiddleware, userController.topupWallet);

  return router;
};
