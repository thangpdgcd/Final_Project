import { Op } from "sequelize";
import db from "../models/index.js";

const getAllProducts = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let products = await db.Products.findAll({
        include: [
          { model: db.Categories, as: "categories", required: false },
          { model: db.Users, as: "users", required: false },
        ],
      });
      if (products && products.length > 0) {
        products = products.map((item) => {
          const raw = item.image;
          if (raw != null && raw !== "") {
            if (Buffer.isBuffer(raw)) {
              item.image = raw.toString("base64");
            }
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

const getProductsById = (productsbyid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const products = await db.Products.findByPk(productsbyid, {
        include: [
          { association: "users", required: false },
          { association: "categories", required: false },
        ],
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

const createProducts = (data) => {
  return new Promise(async (resolve, reject) => {
    const { name, price, stock, description, image, categoriesId, userId } =
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
      const nameExists = await db.Products.findOne({
        where: { name: String(name).trim() },
      });
      if (nameExists) return reject(new Error("Product name already exists."));

      const categoryExists = await db.Categories.findOne({
        where: { categoriesId: Number(categoriesId) },
      });
      if (!categoryExists) return reject(new Error("Category does not exist."));

      const userExists = await db.Users.findOne({
        where: { userId: Number(userId) },
      });
      if (!userExists) return reject(new Error("User does not exist."));

      const finalImage =
        typeof image === "string" && image.trim() ? image.trim() : null;

      const newProducts = await db.Products.create({
        name: String(name).trim(),
        price: Number(price),
        stock: stock === undefined || stock === null ? 0 : Number(stock),
        description: description || "",
        image: finalImage,
        categoriesId: Number(categoriesId),
        userId: Number(userId),
      });

      resolve(newProducts);
    } catch (error) {
      reject(new Error("Unable to create product: " + error.message));
    }
  });
};

const updateProducts = (UpdateProducts, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await db.Products.findByPk(UpdateProducts);
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

const deleteProducts = (Productsid) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await db.Products.findByPk(Productsid);
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

const searchProducts = async (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      const q = String(name ?? "").trim();
      if (!q) {
        return resolve([]);
      }
      const searchproducts = await db.Products.findAll({
        where: { name: { [Op.like]: `%${q}%` } },
        include: [
          { association: "users", required: false },
          { association: "categories", required: false },
        ],
      });
      resolve(searchproducts);
    } catch (error) {
      reject(new Error("Unable to search product: " + error.message));
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
