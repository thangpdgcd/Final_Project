import express from "express";
import userController from "../controllers/usersController.js";

const router = express.Router();

// GET all users
router.get("/users", userController.getAllConUsers);

// GET user by ID
router.get("/users/:id", userController.getOneUsers);

// POST create user
router.post("/create-users", userController.createUsers);

// PUT update user
router.put("/users/:id", userController.updateUsers);

// DELETE user
router.delete("/users/:id", userController.deleteUser);

// Attach all user routes under /api
const initUserRoutes = (app) => {
  app.use("/api", router); // /api/users, /api/users/:id
};

export default initUserRoutes;
