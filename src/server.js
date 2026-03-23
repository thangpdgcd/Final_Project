// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import paypal from "paypal-rest-sdk";

import configViewEngine from "./config/viewEngine.js";
import initRoutes from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: new URL("../.env", import.meta.url) });
//log cloudinary config status

console.log("ENV FILE:", path.resolve(__dirname, "../.env"));
console.log(
  "PAYPAL_CLIENT_ID:",
  process.env.PAYPAL_CLIENT_ID ? "✅ OK" : "❌ MISSING",
);

const app = express();
const PORT = process.env.PORT || 8080;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Đọc cookie (cần cho HttpOnly cookie auth)
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));



app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Auth-Mode"],
    //hêm dòng này để cho phép frontend gửi header X-Auth-Mode qua CORS:
//Frontend login có gửi X-Auth-Mode: bearer
//Trình duyệt sẽ preflight và kiểm tra header này có được backend cho phép không
//Nếu không thêm vào allowedHeaders, request bị chặn ngay từ preflight
//Nên thêm:
//"X-Auth-Mode" vào allowedHeaders là bắt buộc để login chạy được.
    credentials: true,
  })
);

// Quan trọng: handle preflight
// Express 5 (with path-to-regexp v6) does not support the bare "*" path.
// Use a regex route so preflight requests are handled for all paths.
app.options(/.*/, cors());

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
  },
};
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

// when user search not found page
app.use((req, res) => {
  res.status(404).render("notfound");
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

export default app;
