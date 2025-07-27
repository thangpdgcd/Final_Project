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

import { fileURLToPath } from "url";
import path from "path";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app; // nếu có định tuyến giỏ hàng
app.get("/homeapi", (req, res) => {
  res.render("homeapi"); // views/docs.ejs
});

app.use("/openapi.json", express.static(path.join(__dirname, "openapi.json")));

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}/homeapi`);
});
