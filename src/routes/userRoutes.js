import express from "express";
import userController from "../controllers/userController.js"; // Assuming you have a userController to handle the logic

const router = express.Router();

router.get("/api/users", userController.getAllConUsers);
router.get("/api/users/:id", userController.getOneUsers);
router.post("/api/create-users", userController.createUsers);
router.put("/api/users/:id", userController.updateUsers);
router.delete("/api/users/:id", userController.deleteUser);

export default router;
