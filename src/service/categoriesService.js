import db from "../models/index.js";

let { Categories } = db;

// Lấy tất cả danh mục
let getAllCategories = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let categories = await Categories.findAll();
      resolve(categories);
    } catch (error) {
      reject(new Error("Không thể lấy danh sách danh mục: " + error.message));
    }
  });
};

// Lấy danh mục theo ID
let getCategoriesById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let Categories = await Categories.findByPk(id);
      if (!Categories) {
        return reject(new Error("Không tìm thấy danh mục với ID: " + id));
      }
      resolve(Categories);
    } catch (error) {
      reject(new Error("Lỗi khi lấy danh mục theo ID: " + error.message));
    }
  });
};
// Tạo danh mục mới
let createCategories = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { Name, Description } = data;

      if (!Name) {
        return reject(new Error("Tên danh mục là bắt buộc."));
      }

      let newCategories = await Categories.create({ Name, Description });
      resolve(newCategories);
    } catch (error) {
      reject(new Error("Không thể tạo danh mục: " + error.message));
    }
  });
};
// Cập nhật danh mục
let updateCategories = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let Categories = await Categories.findByPk(id);
      if (!Categories) {
        return reject(new Error("Không tìm thấy danh mục để cập nhật."));
      }

      let { Name, Description } = data;

      Categories.Name = Name || Categories.Name;
      Categories.Description = Description || Categories.Description;

      await Categories.save();
      resolve(Categories);
    } catch (error) {
      reject(new Error("Không thể cập nhật danh mục: " + error.message));
    }
  });
};
// Xóa danh mục
let deleteCategories = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let Categories = await Categories.findByPk(id);
      if (!Categories) {
        return reject(new Error("Không tìm thấy danh mục để xóa."));
      }

      await Categories.destroy();
      resolve({ message: "Xóa danh mục thành công." });
    } catch (error) {
      reject(new Error("Không thể xóa danh mục: " + error.message));
    }
  });
};
export default {
  getAllCategories,
  getCategoriesById,
  createCategories,
  updateCategories,
  deleteCategories,
};
