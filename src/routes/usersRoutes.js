import express from "express";
import userController from "../controllers/usersController.js";
import authMiddleware from "../middlewares/auth.js";
import uploadCloud from "../config/uploadConfig.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management APIs
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: List users
 *       401:
 *         description: Unauthorized
 */

router.get("/users", authMiddleware, userController.getAllUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User detail
 *       401:
 *         description: Unauthorized
 */
router.get("/users/:id", authMiddleware, userController.getUsersbyID);

/**
 * @swagger
 * /api/create-users:
 *   post:
 *     summary: Create an admin/user account
 *     tags: [Users]
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
 *                 example: Admin
 *               email:
 *                 type: string
 *                 example: admin@example.com
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
 *     responses:
 *       201:
 *         description: Created
 *       401:
 *         description: Unauthorized
 */
router.post("/create-users", authMiddleware, userController.createAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               roleID:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated
 *       401:
 *         description: Unauthorized
 */
router.put("/users/:id", authMiddleware, userController.updateUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted
 *       401:
 *         description: Unauthorized
 */
router.delete("/users/:id", authMiddleware, userController.deleteUsers);

/**
 * @swagger
 * /api/profile:
 *   put:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", authMiddleware, userController.updateProfile);

/**
 * @swagger
 * /api/upload-avatar:
 *   post:
 *     summary: Upload avatar for current user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Uploaded
 *       400:
 *         description: No file uploaded
 */
router.post("/upload-avatar", authMiddleware, uploadCloud.single('file'), userController.uploadAvatar);

const initUserRoutes = (app) => {
  app.use("/api", router);
};

export default initUserRoutes;
