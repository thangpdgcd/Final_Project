import express from "express";
import dotenv from "dotenv";
import configViewEngine from "../src/config/viewEngine.js";
import initRoutes from "../src/routes/index.js";
import initUserRoutes from "./routes/usersRoutes.js";
import initProductsRoutes from "./routes/productsRoutes.js";
import initCategoriesRoutes from "../src/routes/categoriesRoutes.js";
import initOrdersRoutes from "./routes/ordersRoutes.js";
import initOrderItemsRoutes from "./routes/orderItemsRoutes.js"; // Import the order items routes
import initCartRoutes from "./routes/cartsRoutes.js"; // Import the cart routes
import initCartItemRoutes from "./routes/cartItemsRoutes.js"; // Import the cart items routes
import authMiddleware from "../src/middlewares/auth.js";
import initAuthenticated from "./routes/authRoutes.js";
import initHomeRoutes from "./routes/homeRoutes.js"; // Import the home routes
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";

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
    origin: "http://localhost:3000", // FE đang chạy port 5000
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
// Cấu hình EJS
configViewEngine(app);

// Khai báo route
initRoutes(app); // nếu có
initUserRoutes(app); // nếu có
initProductsRoutes(app); // nếu có định tuyến sản phẩm
initCategoriesRoutes(app); // nếu có định tuyến danh mục
initOrdersRoutes(app); // nếu có định tuyến đơn hàng
initOrderItemsRoutes(app); // nếu có định tuyến đơn hàng

initCartRoutes(app); // nếu có định tuyến giỏ hàng
initCartItemRoutes(app);
initAuthenticated(app); // Khởi tạo các route đã xác thực
initHomeRoutes(app); // Khởi tạo các route trang chủ
// Route mẫu để kiểm tra middleware

app.get("/homeapi", authMiddleware, (req, res) => {
  res.json({ message: "Truy cập thành công", user: req.user });
});
app.use("/openapi.json", express.static(path.join(__dirname, "openapi.json")));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/`);
});
