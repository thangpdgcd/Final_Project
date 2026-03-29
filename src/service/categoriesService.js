import db from "../models/index.js";

const getAllCategories = () => {
  return new Promise(async (resolve, reject) => {
    try {
      const categories = await db.Categories.findAll();
      resolve(categories);
    } catch (error) {
      reject(new Error("Unable to retrieve category list: " + error.message));
    }
  });
};

const getCategoriesById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await db.Categories.findByPk(id);
      if (!category) {
        return reject(new Error("Category not found with ID: " + id));
      }
      resolve(category);
    } catch (error) {
      reject(new Error("Error retrieving category by ID: " + error.message));
    }
  });
};

const createCategories = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let { name, description } = data;

      name = (name || "").trim();
      description = (description || "").trim();

      if (!name) {
        return reject(new Error("Category name is required."));
      }

      const existName = await db.Categories.findOne({
        where: { name },
      });

      if (existName) {
        return reject(new Error("Category name already exists."));
      }

      if (description) {
        const existDesc = await db.Categories.findOne({
          where: { description },
        });

        if (existDesc) {
          return reject(new Error("Category description already exists."));
        }
      }

      const newCategory = await db.Categories.create({
        name,
        description: description || null,
      });

      resolve(newCategory);
    } catch (error) {
      reject(new Error("Unable to create category: " + error.message));
    }
  });
};

const updateCategories = async (id, data) => {
  try {
    const categoryId = Number(id);
    if (!Number.isFinite(categoryId)) {
      throw new Error("Invalid category id.");
    }

    const category = await db.Categories.findByPk(categoryId);
    if (!category) {
      throw new Error("Category not found for update.");
    }

    const name = data?.name ?? data?.Name;
    const description = data?.description ?? data?.Description;

    if (name !== undefined) {
      category.name = String(name).trim();
    }

    if (description !== undefined) {
      category.description = String(description).trim();
    }

    await category.save();

    return category;
  } catch (error) {
    throw new Error("Unable to update category: " + error.message);
  }
};

const deleteCategories = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const category = await db.Categories.findByPk(id);
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

const searchCategories = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const categories = await db.Categories.findAll({
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
