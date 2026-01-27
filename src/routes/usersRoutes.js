import userController from "../../src/controllers/usersController.js"; // Import the user controller
// import authMiddleware from "../middlewares/auth.js";
import express from "express";
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
router.get("/users", userController.getAllUsers);

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
router.get("/users/:id", userController.getUsersbyID);

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
router.post("/create-users", userController.createAdmin);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user by ID
 *     tags: [Users]
 */
router.put("/users/:id", userController.updateUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete user by ID
 *     tags: [Users]
 */
router.delete("/users/:id", userController.deleteUsers);

// Attach all user routes under /api
const initUserRoutes = (app) => {
  app.use("/api", router); // /api/users, /api/users/:id
};

export default initUserRoutes;
