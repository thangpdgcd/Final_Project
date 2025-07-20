import categoryService from "../service/categoryService.js";
// Lấy tất cả danh mục
let getAllCategories = async (req, res) => {
  try {
    let categories = await categoryService.getAllCategories();
    res.render("categories", { title: "category list", categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh mục theo ID
let getCategoryById = async (req, res) => {
  try {
    let id = req.params.id;
    let category = await categoryService.getCategoryById(id);
    res.status(200).json(category);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo danh mục mới
let createCategory = async (req, res) => {
  try {
    let data = req.body;
    let newCategory = await categoryService.createCategory(data);
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật danh mục
let updateCategory = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;
    let updatedCategory = await categoryService.updateCategory(id, data);
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa danh mục
let deleteCategory = async (req, res) => {
  try {
    let id = req.params.id;
    let result = await categoryService.deleteCategory(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
