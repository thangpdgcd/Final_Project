import db from "../models/index.js";

let { Products, Users, Categories } = db;
let getAllProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await db.Products.findAll({
        include: [
          { model: db.Categories, as: "categories" },
          { model: db.Users, as: "users" },
        ],
      });
      if (products && products.length > 0) {
        products = products.map((item) => {
          if (item.image) {
            item.image = item.image.toString("base64");
          }
          return item;
        });
      }
      resolve({
        errorCode: 0,
        message: "OK",
        products,
      });
    } catch (error) {
      reject(new Error("Unable to retrieve product list: " + error.message));
    }
  });
};

let getProductsById = (productsbyid) => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await Products.findByPk(productsbyid, {
        include: [{ association: "users" }, { association: "categories" }],
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
    let { name, price, stock, description, image, categoriesId, userId } =
      data;

    if (
      !name ||
      price === undefined ||
      price === null ||
      categoriesId === undefined ||
      categoriesId === null ||
      userId === undefined ||
      userId === null
    ) {
      return reject(
        new Error("Please provide Name, Price, CategoriesId and UserId."),
      );
    }

    try {
      const nameExists = await Products.findOne({
        where: { name: String(name).trim() },
      });
      if (nameExists) return reject(new Error("Product name already exists."));

      const categoryExists = await Categories.findOne({
        where: { categoriesId: Number(categoriesId) },
      });
      if (!categoryExists) return reject(new Error("Category does not exist."));

      const userExists = await Users.findOne({
        where: { userId: Number(userId) },
      });
      if (!userExists) return reject(new Error("User does not exist."));

      const finalImage =
        typeof image === "string" && image.trim() ? image.trim() : null;

      const newProducts = await Products.create({
        name: String(name).trim(),
        price: Number(price),
        stock: stock === undefined || stock === null ? 0 : Number(stock),
        description: description || "",
        image: finalImage, // ✅ lưu path
        categoriesId: Number(categoriesId),
        userId: Number(userId),
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
  return new Promise(async (resolve, reject) => {
    try {
      let searchproducts = await Products.findAll({
        searchproducts,
        where: { name },
        include: [{ association: "users" }, { association: "categories" }],
      });
      resolve(searchproducts);
    } catch (error) {
      reject(searchproducts);
      throw new Error("Unable to search product: " + error.message);
    }
  });
};

export default {
  getAllProducts,
  getProductsById,
  createProducts,
  updateProducts,
  deleteProducts,
  searchProducts,
};
