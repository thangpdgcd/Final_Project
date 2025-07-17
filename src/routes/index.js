import express from "express";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Welcome to API Root Route");
});

const initRoutes = (app) => {
  app.use("/", router);
};

export default initRoutes;
