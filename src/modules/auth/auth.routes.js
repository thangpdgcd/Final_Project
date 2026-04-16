import express from "express";
import { handleValidationErrors } from "../../middlewares/validateRequest.js";
import { loginRules, registerRules } from "../../validators/authValidators.js";
import authMiddleware from "../../middlewares/auth.js";
import { createAuthRepository } from "./auth.repository.js";
import { createAuthService } from "./auth.service.js";
import { createAuthController } from "./auth.controller.js";

export const buildAuthRouter = () => {
  const router = express.Router();

  const authRepository = createAuthRepository();
  const authService = createAuthService({ authRepository });
  const authController = createAuthController({ authService });

  router.post(
    "/register",
    registerRules,
    handleValidationErrors,
    authController.registerUser,
  );

  router.post(
    "/login",
    loginRules,
    handleValidationErrors,
    authController.login,
  );

  router.get("/me", authMiddleware, authController.getMe);
  router.post("/logout", authController.logout);
  router.post("/refresh-token", authController.refreshToken);

  return router;
};

