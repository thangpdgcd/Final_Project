import productService from "../service/productService.js";

// Lấy tất cả sản phẩm
let getAllProducts = async (req, res) => {
  try {
    let products = await productService.getAllProducts();
    res.render("products", { title: "User List", products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID
let getProductById = async (req, res) => {
  let id = req.params.id;
  try {
    let product = await productService.getProductById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo mới sản phẩm
let createProduct = async (req, res) => {
  try {
    let product = await productService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
let updateProduct = async (req, res) => {
  let id = req.params.id;
  try {
    let updated = await productService.updateProduct(id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm
let deleteProduct = async (req, res) => {
  let id = req.params.id;
  try {
    let result = await productService.deleteProduct(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
