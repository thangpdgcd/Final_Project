import productsService from "../service/productsService.js";

// Lấy tất cả sản phẩm
const getAllProducts = async (req, res) => {
  try {
    const products = await productsService.getAllProducts();
    res.render("products", { products }); // nếu dùng EJS
    // res.status(200).json(products); // nếu dùng API JSON
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm theo ID
const getProductsById = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await productsService.getProductsById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// Tạo sản phẩm
const createProducts = async (req, res) => {
  try {
    const newProduct = await productsService.createProducts(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
const updateProducts = async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await productsService.updateProducts(id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa sản phẩm
const deleteProducts = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await productsService.deleteProducts(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Export dưới dạng đối tượng (default)
export default {
  getAllProducts,
  getProductsById,
  createProducts,
  updateProducts,
  deleteProducts,
};
