import CategoriesService from "../service/categoriesService.js";
// Lấy tất cả danh mục
let getAllCategories = async (req, res) => {
  try {
    let { name } = req.query;
    if (name) {
      let result = await CategoriesService.searchCategories(name);
      return res.status(200).json(result);
    }
    let categories = await CategoriesService.getAllCategories();

    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Lấy danh mục theo ID
let getCategoriesById = async (req, res) => {
  try {
    let id = req.params.id;
    let Categories = await CategoriesService.getCategoriesById(id);
    res.status(200).json(Categories);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo danh mục mới
let createCategories = async (req, res) => {
  try {
    let data = req.body;
    let newCategories = await CategoriesService.createCategories(data);
    res.status(201).json(newCategories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật danh mục
let updateCategories = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;
    let updatedCategories = await CategoriesService.updateCategories(id, data);
    res.status(200).json(updatedCategories);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa danh mục
let deleteCategories = async (req, res) => {
  try {
    let id = req.params.id;
    let result = await CategoriesService.deleteCategories(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  getAllCategories,
  getCategoriesById,
  createCategories,
  updateCategories,
  deleteCategories,
};
