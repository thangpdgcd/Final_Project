import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import path from "path";
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
import initPaymentRoutes from "./routes/paymentsRoutes.js";
import paypal from "paypal-rest-sdk";
dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id: process.env.PAYPAL_CLIENT_ID,
  client_secret: process.env.PAYPAL_SECRET,
});

configViewEngine(app);

initRoutes(app);
initUserRoutes(app);
initProductsRoutes(app);
initCategoriesRoutes(app);
initOrdersRoutes(app);
initUploadRoutes(app);
initCartRoutes(app);
initAuthenticated(app);
initHomeRoutes(app);
initPaymentRoutes(app);
initCloudinaryRoutes(app);
initPaymentsRoutes(app);

app.get("/homeapi", authMiddleware, (req, res) => {
  res.json({ message: "Truy cập thành công", user: req.user });
});

app.use("/openapi.json", express.static(path.join(__dirname, "openapi.json")));

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}/`);
  });
}

export default app;
