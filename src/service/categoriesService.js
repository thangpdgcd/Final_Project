import db from "../models/index.js";

let { Categories } = db;

let getAllCategories = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let categories = await Categories.findAll();
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

      if (!name) {
        return reject(new Error("Category name is required."));
      }

      let newCategory = await Categories.create({ name, description });
      resolve(newCategory);
    } catch (error) {
      reject(new Error("Unable to create category: " + error.message));
    }
  });
};

let updateCategories = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let category = await Categories.findByPk(id);
      if (!category) {
        return reject(new Error("Category not found for update."));
      }

      let { Name, Description } = data;

      category.Name = Name || category.Name;
      category.Description = Description || category.Description;

      await category.save();
      resolve(category);
    } catch (error) {
      reject(new Error("Unable to update category: " + error.message));
    }
  });
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
