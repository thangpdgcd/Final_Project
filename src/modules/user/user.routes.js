import express from "express";
import authMiddleware from "../../core/middlewares/auth.js";
import uploadCloud from "../../config/uploadConfig.js";
import { createUserRepository } from "./user.repository.js";
import { createUserService } from "./user.service.js";
import { createUserController } from "./user.controller.js";

export const buildUserRouter = () => {
  const router = express.Router();

  const userRepository = createUserRepository();
  const userService = createUserService({ userRepository });
  const userController = createUserController({ userService });

  router.put("/profile", authMiddleware, userController.updateProfile);
  router.post(
    "/upload-avatar",
    authMiddleware,
    uploadCloud.single("file"),
    userController.uploadAvatar,
  );

  return router;
};
