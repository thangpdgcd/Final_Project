import express from "express";
import dotenv from "dotenv";
import configViewEngine from "../src/config/viewEngine.js";
import initRoutes from "../src/routes/index.js"; // nếu có định tuyến
import initUserRoutes from "../src/routes/userRoutes.js"; // nếu có định tuyến người dùng
import initProductRoutes from "../src/routes/productRoutes.js"; // nếu có định tuyến sản phẩm
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
initProductRoutes(app); // nếu có định tuyến sản phẩm
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
