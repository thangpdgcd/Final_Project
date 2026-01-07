import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";

import paypal from "paypal-rest-sdk";

import initPaymentsRoutes from "./routes/paymentsRoutes.js";
import configViewEngine from "../src/config/viewEngine.js";
import initRoutes from "../src/routes/index.js";
import initUserRoutes from "./routes/usersRoutes.js";
import initProductsRoutes from "./routes/productsRoutes.js";
import initCategoriesRoutes from "../src/routes/categoriesRoutes.js";
import initOrdersRoutes from "./routes/ordersRoutes.js";
import initCartRoutes from "./routes/cartsRoutes.js";
import initUploadRoutes from "./routes/uploadRoute.js";
import initCloudinaryRoutes from "./routes/cloudinaryRoutes.js";
import initAuthenticated from "./routes/authRoutes.js";
import initHomeRoutes from "./routes/homeRoutes.js";
import authMiddleware from "../src/middlewares/auth.js";

// ✅ tính __dirname trước
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ ép dotenv đọc đúng file .env (thường nằm ở backend/.env)
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ✅ debug để chắc chắn env đã load (xong rồi có thể xoá)
console.log("ENV FILE:", path.resolve(__dirname, "../.env"));
console.log(
  "PAYPAL_CLIENT_ID:",
  process.env.PAYPAL_CLIENT_ID ? "✅ OK" : "❌ MISSING"
);

const app = express();
const PORT = process.env.PORT || 8080;

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

// ✅ config PayPal chỉ chạy khi có env
if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.error("❌ Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env");
} else {
  paypal.configure({
    mode: "sandbox",
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
  });
  console.log("✅ PayPal configured");
}

configViewEngine(app);

// routes
initRoutes(app);
initUserRoutes(app);
initProductsRoutes(app);
initCategoriesRoutes(app);
initOrdersRoutes(app);
initUploadRoutes(app);
initCartRoutes(app);
initAuthenticated(app);
initHomeRoutes(app);
initPaymentsRoutes(app); // ✅ chỉ gọi 1 lần, bỏ initPaymentRoutes trùng
initCloudinaryRoutes(app);

app.get("/homeapi", authMiddleware, (req, res) => {
  res.json({ message: "Truy cập thành công", user: req.user });
});

app.use("/openapi.json", express.static(path.join(__dirname, "openapi.json")));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running at http://0.0.0.0:${PORT}/`);
});

export default app;
