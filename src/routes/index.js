import express from "express";
import userRoutes from "./userRoutes.js";
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to API Root Route");
});

const initRoutes = (app) => {
  app.use("/", router);
  app.use("/", userRoutes);
};

export default initRoutes;
