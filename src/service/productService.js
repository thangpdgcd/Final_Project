// src/services/productService.js
import db from "../models/index.js";

let { Product, User, Category } = db;

let getAllProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await Product.findAll({
        include: [{ association: "user" }, { association: "category" }],
      });
      resolve(products);
    } catch (error) {
      reject(new Error("Không thể lấy danh sách sản phẩm: " + error.message));
    }
  });
};

let getProductById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await Product.findByPk(id, {
        include: [{ association: "user" }, { association: "category" }],
      });
      if (!product) {
        reject(new Error("Sản phẩm không tồn tại"));
      } else {
        resolve(product);
      }
    } catch (error) {
      reject(new Error("Không thể lấy sản phẩm: " + error.message));
    }
  });
};

let createProduct = (data) => {
  return new Promise(async (resolve, reject) => {
    let {
      Name,
      Price,
      Stock = 0,
      Description = null,
      Image = null,
      Categories_ID,
      Users_ID,
    } = data;

    // Validate bắt buộc
    if (!Name || !Price || !Categories_ID || !Users_ID) {
      return reject(
        new Error("Vui lòng cung cấp Name, Price, Categories_ID và Users_ID.")
      );
    }
    try {
      // 1. Kiểm tra tên sản phẩm trùng
      let nameExists = await Product.findOne({ where: { Name } });
      if (nameExists) return reject(new Error("Tên sản phẩm đã tồn tại."));

      // 2. Kiểm tra danh mục tồn tại (dùng where)
      let categoryExists = await Category.findOne({
        where: { id: Categories_ID },
      });
      if (!categoryExists) return reject(new Error("Danh mục không tồn tại."));

      // 3. Kiểm tra người dùng tồn tại (dùng where)
      let userExists = await User.findOne({ where: { id: Users_ID } });
      if (!userExists) return reject(new Error("Người dùng không tồn tại."));

      // 4. Tạo sản phẩm
      let newProduct = await Product.create({
        Name,
        Price,
        Stock,
        Description,
        Image,
        Categories_ID,
        Users_ID,
      });

      resolve(newProduct);
    } catch (error) {
      reject(new Error("Không thể tạo sản phẩm: " + error.message));
    }
  });
};

let updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await Product.findByPk(id);
      if (!product) {
        reject(new Error("Sản phẩm không tồn tại"));
      } else {
        await product.update(data);
        resolve(product);
      }
    } catch (error) {
      reject(new Error("Không thể cập nhật sản phẩm: " + error.message));
    }
  });
};

let deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await Product.findByPk(id);
      if (!product) {
        reject(new Error("Sản phẩm không tồn tại"));
      } else {
        await product.destroy();
        resolve({ message: "Xóa sản phẩm thành công" });
      }
    } catch (error) {
      reject(new Error("Không thể xóa sản phẩm: " + error.message));
    }
  });
};

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
