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
 *     summary: Đăng ký tài khoản mới
 *     description: |
 *       Bắt buộc: `name`, `email`, `password` (mật khẩu ≥ 6 ký tự).
 *       Không gửi `roleID` → mặc định user thường (`"1"`).
 *       **Test nhanh:** mở tab này → **Try it out** → giữ JSON mẫu bên dưới → **Execute**.
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
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *                 description: Tùy chọn; 9–15 chữ số (có thể có +)
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *               roleID:
 *                 type: string
 *                 enum: ["1", "2", "3"]
 *                 description: "1 = user, 2 = admin, 3 = manager (thường để test chỉ cần bỏ trường này)"
 *           example:
 *             name: "Nguyễn Văn Test"
 *             email: "swagger.test@example.com"
 *             password: "123456"
 *             address: "Quận 1, TP.HCM"
 *             phoneNumber: "0901234567"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Đăng ký thành công
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     roleID:
 *                       type: string
 *             example:
 *               message: "Đăng ký thành công"
 *               user:
 *                 id: 10
 *                 name: "Nguyễn Văn Test"
 *                 email: "swagger.test@example.com"
 *                 roleID: "1"
 *       400:
 *         description: Lỗi validation hoặc email đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               missingFields:
 *                 summary: Thiếu trường
 *                 value: { message: "Tên, Email và mật khẩu là bắt buộc." }
 *               duplicateEmail:
 *                 summary: Email trùng
 *                 value: { message: "Email already exists." }
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
