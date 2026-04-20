import express from "express";
import { handleValidationErrors } from "../middlewares/validateRequest.js";
import { loginRules, registerRules } from "../validators/authValidators.js";
import authMiddleware from "../middlewares/auth.js";
import { createAuthRepository } from "../services/auth.repository.js";
import { createAuthService } from "../services/auth.service.js";
import { createAuthController } from "../controllers/auth.controller.js";

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

  // Google sign-in (expects { token: <google id_token> })
  router.post("/auth/google", authController.googleLogin);

  router.get("/me", authMiddleware, authController.getMe);
  router.post("/logout", authController.logout);
  router.post("/refresh-token", authController.refreshToken);

  // Aliases for frontend clients that use `/api/auth/*` (base URL already includes `/api`).
  router.post("/auth/refresh", authController.refreshToken);
  router.post("/auth/logout", authController.logout);
  router.post("/auth/change-password", authMiddleware, authController.changePassword);
  router.get("/users/me", authMiddleware, authController.getMe);

  return router;
};

