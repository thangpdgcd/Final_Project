// src/services/ProductsService.js
import db from "../models/index.js";

let { Products, User, Categories } = db;

let getAllProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let Productss = await Products.findAll({
        include: [{ association: "user" }, { association: "Categories" }],
      });
      resolve(Productss);
    } catch (error) {
      reject(new Error("Không thể lấy danh sách sản phẩm: " + error.message));
    }
  });
};

let getProductsById = (Productsbyid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let Products = await Products.findByPk(Productsbyid, {
        include: [{ association: "user" }, { association: "Categories" }],
      });
      if (!Products) {
        reject(new Error("Sản phẩm không tồn tại"));
      } else {
        resolve(Products);
      }
    } catch (error) {
      reject(new Error("Không thể lấy sản phẩm: " + error.message));
    }
  });
};

let createProducts = (data) => {
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
      let nameExists = await Products.findOne({ where: { Name } });
      if (nameExists) return reject(new Error("Tên sản phẩm đã tồn tại."));

      // 2. Kiểm tra danh mục tồn tại (dùng where)
      let CategoriesExists = await Categories.findOne({
        where: { Categories_ID: Categories_ID },
      });
      if (!CategoriesExists)
        return reject(new Error("Danh mục không tồn tại."));

      // 3. Kiểm tra người dùng tồn tại (dùng where)
      let userExists = await User.findOne({ where: { Users_ID: Users_ID } });
      if (!userExists) return reject(new Error("Người dùng không tồn tại."));

      // 4. Tạo sản phẩm
      let newProducts = await Products.create({
        Name,
        Price,
        Stock,
        Description,
        Image,
        Categories_ID,
        Users_ID,
      });

      resolve(newProducts);
    } catch (error) {
      reject(new Error("Không thể tạo sản phẩm: " + error.message));
    }
  });
};

let updateProducts = (UpdateProducts, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let Products = await Products.findByPk(UpdateProducts);
      if (!Products) {
        reject(new Error("Sản phẩm không tồn tại"));
      } else {
        await Products.update(data);
        resolve(Products);
      }
    } catch (error) {
      reject(new Error("Không thể cập nhật sản phẩm: " + error.message));
    }
  });
};

let deleteProducts = (Productsid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let Products = await Products.findByPk(Productsid);
      if (!Products) {
        reject(new Error("Sản phẩm không tồn tại"));
      } else {
        await Products.destroy();
        resolve({ message: "Xóa sản phẩm thành công" });
      }
    } catch (error) {
      reject(new Error("Không thể xóa sản phẩm: " + error.message));
    }
  });
};

export default {
  getAllProducts,
  getProductsById,
  createProducts,
  updateProducts,
  deleteProducts,
};
