import express from "express";
import authMiddleware from "../../core/middlewares/auth.js";
import { createStaffRepository } from "./staff.repository.js";
import { createStaffService } from "./staff.service.js";
import { createStaffController } from "./staff.controller.js";

export const buildStaffRouter = () => {
  const router = express.Router();

  const staffRepository = createStaffRepository();
  const staffService = createStaffService({ staffRepository });
  const staffController = createStaffController({ staffService });

  router.get("/users", authMiddleware, staffController.getAllUsers);
  router.get("/users/:id", authMiddleware, staffController.getUsersById);
  router.post("/create-users", authMiddleware, staffController.createAdmin);
  router.put("/users/:id", authMiddleware, staffController.updateUsers);
  router.delete("/users/:id", authMiddleware, staffController.deleteUsers);

  return router;
};
