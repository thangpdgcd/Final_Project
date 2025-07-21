import express from "express";
import dotenv from "dotenv";
import configViewEngine from "../src/config/viewEngine.js";
import initRoutes from "../src/routes/index.js";
import initUserRoutes from "./routes/usersRoutes.js";
import initProductsRoutes from "./routes/productsRoutes.js";
import initCategoriesRoutes from "../src/routes/categoriesRoutes.js";
import initOrdersRoutes from "./routes/ordersRoutes.js";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;

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
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
