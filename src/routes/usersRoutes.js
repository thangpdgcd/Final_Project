import express from "express";
import userController from "../controllers/usersController.js";
import authMiddleware from "../middlewares/auth.js";

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
 *         description: Success
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
 *     responses:
 *       200:
 *         description: Success
 */
router.get("/users/:id", authMiddleware, userController.getUsersbyID);

/**
 * @swagger
 * /api/create-users:
 *   post:
 *     summary: Create a new admin user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: User created
 */
router.post("/create-users", authMiddleware, userController.createAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 */
router.put("/users/:id", authMiddleware, userController.updateUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 */
router.delete("/users/:id", authMiddleware, userController.deleteUsers);

// Attach all user routes under /api
const initUserRoutes = (app) => {
  app.use("/api", router); // /api/users, /api/users/:id
};

export default initUserRoutes;
