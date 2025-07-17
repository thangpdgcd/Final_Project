import express from "express";
import path from "path";
import { fileURLToPath } from "url";

// Xử lý __dirname trong ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configViewEngine = (app) => {
  // Đường dẫn đến thư mục public (ảnh, css, js tĩnh)
  app.use(express.static(path.join(__dirname, "../public")));

  // Thiết lập EJS làm view engine
  app.set("view engine", "ejs");

  // Trỏ tới thư mục chứa các file .ejs
  app.set("views", path.join(__dirname, "../views"));
};

export default configViewEngine;
