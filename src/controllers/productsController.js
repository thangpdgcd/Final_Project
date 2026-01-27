import productsService from "../service/productsService.js";

let getAllProducts = async (req, res) => {
  try {
    let { name } = req.query;
    if (name) {
      let result = await productsService.searchProducts(name);
      return res.status(200).json(result);
    }
    let products = await productsService.getAllProducts();
    return res.status(200).json(products);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let getProductsById = async (req, res) => {
  const id = req.params.id;
  try {
    const product = await productsService.getProductsById(id);
    res.status(200).json(product);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

let createProducts = async (req, res) => {
  try {
    const newProduct = await productsService.createProducts(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let updateProducts = async (req, res) => {
  const id = req.params.id;
  try {
    const updated = await productsService.updateProducts(id, req.body);
    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let deleteProducts = async (req, res) => {
  const id = req.params.id;
  try {
    const result = await productsService.deleteProducts(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  getAllProducts,
  getProductsById,
  createProducts,
  updateProducts,
  deleteProducts,
};
