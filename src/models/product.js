// src/models/product.js
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      // Một sản phẩm thuộc về một người dùng
      Product.belongsTo(models.User, {
        foreignKey: "Users_ID",
        as: "user",
      });

      // Một sản phẩm thuộc về một danh mục (Category)
      Product.belongsTo(models.Category, {
        foreignKey: "Category_ID",
        as: "category",
      });
    }
  }

  Product.init(
    {
      Name: DataTypes.STRING,
      Users_ID: DataTypes.INTEGER,
      Category_ID: DataTypes.INTEGER, // đã sửa tên này
      Description: DataTypes.TEXT,
      Price: DataTypes.FLOAT,
      Stock: DataTypes.INTEGER,
      Image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product",
    }
  );

  return Product;
};
