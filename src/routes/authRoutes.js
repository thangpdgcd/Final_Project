import authController from "../controllers/authController.js";
import authMiddleware from "../middlewares/auth.js";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Authorization
 */

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               address:
 *                 type: string
 *                 example: HCM
 *               phoneNumber:
 *                 type: string
 *                 example: "0900000001"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "123456"
 *               roleID:
 *                 type: string
 *                 enum: ["1", "2", "3"]
 *                 example: "2"
 *                 description: "1=user, 2=admin, 3=manager"
 *     responses:
 *       201:
 *         description: Register success
 *       400:
 *         description: Bad request
 */
router.post("/register", authController.registerUser);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login and receive JWT access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT access token (paste into Swagger Authorize)
 *                 user:
 *                   type: object
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/me:
 *   get:
 *     summary: Get current logged-in user info
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Current user info
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, authController.getMe);

/**
 * @swagger
 * /api/logout:
 *   post:
 *     summary: Logout (clears refresh token cookie)
 *     tags: [Auth]
 *     security: []
 *     responses:
 *       200:
 *         description: Logout success
 */
router.post("/logout", authController.logout);

/**
 * Refresh token: expects refresh_token in HTTP-only cookie
 */
router.post("/refresh-token", authController.refreshToken);

const initAuthenticated = (app) => {
  app.use("/api", router);
};

export default initAuthenticated;
