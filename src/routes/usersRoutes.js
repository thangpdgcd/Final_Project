import express from "express";
import userController from "../../src/controllers/usersController.js"; // Import the user controller

const router = express.Router();

// GET all users
router.get("/users", userController.getAllUsers);

// GET user by ID
router.get("/users/:id", userController.getOneUsers);

// POST create user
router.post("/create-users", userController.createAdmin);

// PUT update user
router.put("/users/:id", userController.updateUsers);

// DELETE user
router.delete("/users/:id", userController.deleteUsers);

// Search users

// Attach all user routes under /api
const initUserRoutes = (app) => {
  app.use("/api", router); // /api/users, /api/users/:id
};

export default initUserRoutes;
