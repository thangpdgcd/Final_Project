// src/server.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import paypal from "paypal-rest-sdk";

import configViewEngine from "./config/viewEngine.js";
import { buildCorsMiddleware } from "./config/corsConfig.js";
import initRoutes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file explicitly so local `node src/server.js` can pick the right one.
// Priority:
// - `.env.production` when NODE_ENV=production
// - otherwise `.env`
const envFileName =
  process.env.NODE_ENV === "production" ? ".env.production" : ".env";
const envPath = path.resolve(__dirname, `../${envFileName}`);
if (fs.existsSync(envPath)) {
  // override=true so `.env.production` can replace values loaded earlier
  // by other modules that call dotenv.config() with default `.env`.
  dotenv.config({ path: envPath, override: true });
} else {
  // Fallback to .env if the chosen file doesn't exist
  dotenv.config({ path: path.resolve(__dirname, "../.env"), override: true });
}
//log cloudinary config status

console.log("ENV FILE:", envPath);
console.log(
  "PAYPAL_CLIENT_ID:",
  process.env.PAYPAL_CLIENT_ID ? "✅ OK" : "❌ MISSING",
);

const app = express();
const PORT = process.env.PORT || 8080;

// middlewares
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser()); // Đọc cookie (cần cho HttpOnly cookie auth)

const corsMiddleware = buildCorsMiddleware();
app.use(corsMiddleware);

// Quan trọng: handle preflight
// Express 5 (with path-to-regexp v6) does not support the bare "*" path.
// Use a regex route so preflight requests are handled for all paths.
app.options(/.*/, corsMiddleware);

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.error("❌ Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env");
} else {
  paypal.configure({
    mode: "sandbox",
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    limit: "50mb",
  });
  console.log("✅ PayPal configured");
}

configViewEngine(app);
initRoutes(app);

// Swagger phải đặt TRƯỚC 404 handler (Express xử lý theo thứ tự)
const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true, // Lưu token khi refresh trang
    docExpansion: "full", // Mở rộng danh sách endpoint ngay trên Swagger home
  },
};

// Useful for tools like Rapidoc / manual testing (and for your `homeapi.ejs`).
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// when user search not found page
app.use((req, res) => {
  res.status(404).render("notfound");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

export default app;
