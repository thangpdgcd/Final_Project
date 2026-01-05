import db from "../models/index.js";

let { Categories } = db;
let getAllCategories = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const categories = await Categories.findAll(); // ✅ Dùng đúng tên model import
      resolve(categories);
    } catch (error) {
      reject(new Error("Unable to retrieve category list: " + error.message));
    }
  });
};

let getCategoriesById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let category = await Categories.findByPk(id);
      if (!category) {
        return reject(new Error("Category not found with ID: " + id));
      }
      resolve(category);
    } catch (error) {
      reject(new Error("Error retrieving category by ID: " + error.message));
    }
  });
};
let createCategories = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { name, description } = data;

      name = (name || "").trim();
      description = (description || "").trim();

      if (!name) {
        return reject(new Error("Category name is required."));
      }

      const existName = await Categories.findOne({
        where: { name },
      });

      if (existName) {
        return reject(new Error("Category name already exists."));
      }

      if (description) {
        const existDesc = await Categories.findOne({
          where: { description },
        });

        if (existDesc) {
          return reject(new Error("Category description already exists."));
        }
      }

      let newCategory = await Categories.create({
        name,
        description: description || null,
      });

      resolve(newCategory);
    } catch (error) {
      reject(new Error("Unable to create category: " + error.message));
    }
  });
};
let updateCategories = async (id, data) => {
  try {
    let categoryId = Number(id);
    if (!Number.isFinite(categoryId)) {
      throw new Error("Invalid category id.");
    }

    let category = await Categories.findByPk(categoryId);
    if (!category) {
      throw new Error("Category not found for update.");
    }

    // hỗ trợ cả 2 kiểu key
    let name = data?.name ?? data?.Name;
    let description = data?.description ?? data?.Description;

    // chỉ update khi client có gửi field
    if (name !== undefined) {
      category.name = String(name).trim();
    }

    if (description !== undefined) {
      category.description = String(description).trim(); // cho phép ""
    }

    await category.save();

    return category;
  } catch (error) {
    throw new Error("Unable to update category: " + error.message);
  }
};

let deleteCategories = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let category = await Categories.findByPk(id);
      if (!category) {
        return reject(new Error("Category not found for deletion."));
      }

      await category.destroy();
      resolve({ message: "Category deleted successfully." });
    } catch (error) {
      reject(new Error("Unable to delete category: " + error.message));
    }
  });
};

let searchCategories = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let categories = await Categories.findAll({
        where: {
          name: name,
        },
      });

      resolve(categories);
    } catch (error) {
      reject(new Error("Unable to search category: " + error.message));
    }
  });
};

export default {
  getAllCategories,
  getCategoriesById,
  createCategories,
  updateCategories,
  deleteCategories,
  searchCategories,
};
