import express from "express";
import userController from "../../src/controllers/usersController.js"; // Import the user controller
// import authMiddleware from "../middlewares/auth.js";
const router = express.Router();

// GET all users
// routes/userRoutes.js
router.get("/users", userController.getAllUsers);
router.get("/users/:id", userController.getUsersbyID);
router.post("/create-users", userController.createAdmin);
router.put("/users/:id", userController.updateUsers);
router.delete("/users/:id", userController.deleteUsers);

// Search users

// Attach all user routes under /api
const initUserRoutes = (app) => {
  app.use("/api", router); // /api/users, /api/users/:id
};

export default initUserRoutes;
