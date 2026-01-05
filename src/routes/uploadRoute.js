import express from "express";
import upload from "../config/upload.js";

const router = express.Router();

const initCloudinaryRoutes = (app) => {
  router.post("/upload", upload.single("image"), (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    return res.json({
      imageUrl: req.file.path,
      publicId: req.file.filename,
    });
  });

  app.use("/api", router);
};

export default initCloudinaryRoutes;
