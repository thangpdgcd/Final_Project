import express from "express";
import authController from "../controllers/authController.js";

const router = express.Router();

// API JSON
router.post("/register", authController.registerUser);
router.post("/login", authController.login);

// View EJS
router.get("/login", authController.showLoginPage);
router.post("/loginEJS", authController.loginEJS);

router.get("/register", authController.showRegisterPage);
router.post("/registerEJS", authController.registerEJS);



const initAuthenticated = (app) => {
  app.use("/api", router);
};

export default initAuthenticated;
