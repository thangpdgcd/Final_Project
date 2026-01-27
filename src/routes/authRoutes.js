import authController from "../controllers/authController.js";
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
 *     summary: Đăng ký tài khoản
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Nguyễn Văn A
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post("/register", authController.registerUser);

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Đăng nhập (API - JWT)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: Đăng nhập thành công, trả về token
 *       401:
 *         description: Sai email hoặc mật khẩu
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /api/login:
 *   get:
 *     summary: Hiển thị trang đăng nhập (EJS)
 *     tags: [Auth - View]
 *     responses:
 *       200:
 *         description: Trang login EJS
 */
router.get("/login", authController.showLoginPage);

/**
 * @swagger
 * /api/loginEJS:
 *   post:
 *     summary: Đăng nhập bằng form EJS
 *     tags: [Auth - View]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@gmail.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       302:
 *         description: Redirect sau khi đăng nhập
 */
router.post("/loginEJS", authController.loginEJS);

/**
 * @swagger
 * /api/register:
 *   get:
 *     summary: Hiển thị trang đăng ký (EJS)
 *     tags: [Auth - View]
 *     responses:
 *       200:
 *         description: Trang register EJS
 */
router.get("/register", authController.showRegisterPage);

/**
 * @swagger
 * /api/registerEJS:
 *   post:
 *     summary: Đăng ký bằng form EJS
 *     tags: [Auth - View]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       302:
 *         description: Redirect sau khi đăng ký
 */
router.post("/registerEJS", authController.registerEJS);

const initAuthenticated = (app) => {
  app.use("/api", router);
};

export default initAuthenticated;
