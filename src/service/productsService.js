import db from "../models/index.js";

let { Products, Users, Categories } = db;

let getAllProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await Products.findAll({
        include: [{ association: "users" }, { association: "categories" }],
      });
      resolve(products);
    } catch (error) {
      reject(new Error("Unable to retrieve product list: " + error.message));
    }
  });
};

let getProductsById = (productsbyid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await Products.findByPk(productsbyid, {
        include: [{ association: "users" }, { association: "Categories" }],
      });
      if (!products) {
        reject(new Error("Product does not exist"));
      } else {
        resolve(products);
      }
    } catch (error) {
      reject(new Error("Unable to retrieve product: " + error.message));
    }
  });
};

let createProducts = (data) => {
  return new Promise(async (resolve, reject) => {
    let {
      name,
      price,
      stock = 0,
      description = null,
      image = null,
      categories_ID,
      user_ID,
    } = data;

    if (!name || !price || !categories_ID || !user_ID) {
      return reject(
        new Error("Please provide Name, Price, Categories_ID and Users_ID.")
      );
    }
    try {
      let nameExists = await Products.findOne({ where: { name } });
      if (nameExists) return reject(new Error("Product name already exists."));

      let CategoriesExists = await Categories.findOne({
        where: { categories_ID: categories_ID },
      });
      if (!CategoriesExists)
        return reject(new Error("Category does not exist."));

      let userExists = await Users.findOne({ where: { user_ID: user_ID } });
      if (!userExists) return reject(new Error("User does not exist."));

      let newProducts = await Products.create({
        name,
        price,
        stock,
        description,
        image,
        categories_ID,
        user_ID,
      });

      resolve(newProducts);
    } catch (error) {
      reject(new Error("Unable to create product: " + error.message));
    }
  });
};

let updateProducts = (UpdateProducts, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await Products.findByPk(UpdateProducts);
      if (!product) {
        reject(new Error("Product does not exist"));
      } else {
        await product.update(data);
        resolve(product);
      }
    } catch (error) {
      reject(new Error("Unable to update product: " + error.message));
    }
  });
};

let deleteProducts = (Productsid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let product = await Products.findByPk(Productsid);
      if (!product) {
        reject(new Error("Product does not exist"));
      } else {
        await product.destroy();
        resolve({ message: "Product deleted successfully" });
      }
    } catch (error) {
      reject(new Error("Unable to delete product: " + error.message));
    }
  });
};

let searchProducts = async (name) => {
  try {
    return await Products.findAll({
      where: { name },
      include: [{ association: "users" }, { association: "categories" }],
    });
  } catch (error) {
    throw new Error("Unable to search product: " + error.message);
  }
};

export default {
  getAllProducts,
  getProductsById,
  createProducts,
  updateProducts,
  deleteProducts,
  searchProducts,
};
