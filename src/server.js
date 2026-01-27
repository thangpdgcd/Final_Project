// src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import paypal from "paypal-rest-sdk";

import configViewEngine from "../src/config/viewEngine.js";
import initRoutes from "../src/routes/index.js";

import initUserRoutes from "./routes/usersRoutes.js";
import initProductsRoutes from "./routes/productsRoutes.js";
import initCategoriesRoutes from "../src/routes/categoriesRoutes.js";
import initOrdersRoutes from "./routes/ordersRoutes.js";
import initCartRoutes from "./routes/cartsRoutes.js";

import initAuthenticated from "./routes/authRoutes.js";
import initHomeRoutes from "./routes/homeRoutes.js";
import initPaymentsRoutes from "./routes/paymentsRoutes.js";

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
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
    optionsSuccessStatus: 200,
    limit: "50mb",
  }),
);

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
initUserRoutes(app);
initProductsRoutes(app);
initCategoriesRoutes(app);
initOrdersRoutes(app);
initCartRoutes(app);
initAuthenticated(app);
initHomeRoutes(app);
initPaymentsRoutes(app);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
});

export default app;
