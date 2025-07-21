import express from "express";
import dotenv from "dotenv";
import configViewEngine from "../src/config/viewEngine.js";
import initRoutes from "../src/routes/index.js"; // nếu có định tuyến
import initUserRoutes from "./routes/usersRoutes.js"; // nếu có định tuyến người dùng
import initProductsRoutes from "./routes/productsRoutes.js"; // nếu có định tuyến sản phẩm
import initCategoriesRoutes from "../src/routes/categoriesRoutes.js"; // nếu có định tuyến danh mục
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

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
