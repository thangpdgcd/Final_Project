import db from "../models/index.js";

let { Category } = db;

// Lấy tất cả danh mục
let getAllCategories = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let categories = await Category.findAll();
      resolve(categories);
    } catch (error) {
      reject(new Error("Không thể lấy danh sách danh mục: " + error.message));
    }
  });
};

// Lấy danh mục theo ID
let getCategoryById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let category = await Category.findByPk(id);
      if (!category) {
        return reject(new Error("Không tìm thấy danh mục với ID: " + id));
      }
      resolve(category);
    } catch (error) {
      reject(new Error("Lỗi khi lấy danh mục theo ID: " + error.message));
    }
  });
};
// Tạo danh mục mới
let createCategory = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { Name, Description } = data;

      if (!Name) {
        return reject(new Error("Tên danh mục là bắt buộc."));
      }

      let newCategory = await Category.create({ Name, Description });
      resolve(newCategory);
    } catch (error) {
      reject(new Error("Không thể tạo danh mục: " + error.message));
    }
  });
};
// Cập nhật danh mục
let updateCategory = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let category = await Category.findByPk(id);
      if (!category) {
        return reject(new Error("Không tìm thấy danh mục để cập nhật."));
      }

      let { Name, Description } = data;

      category.Name = Name || category.Name;
      category.Description = Description || category.Description;

      await category.save();
      resolve(category);
    } catch (error) {
      reject(new Error("Không thể cập nhật danh mục: " + error.message));
    }
  });
};
// Xóa danh mục
let deleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let category = await Category.findByPk(id);
      if (!category) {
        return reject(new Error("Không tìm thấy danh mục để xóa."));
      }

      await category.destroy();
      resolve({ message: "Xóa danh mục thành công." });
    } catch (error) {
      reject(new Error("Không thể xóa danh mục: " + error.message));
    }
  });
};
export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
