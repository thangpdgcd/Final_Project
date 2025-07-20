import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Product extends Model {
    static associate(models) {
      // Một sản phẩm thuộc về một người dùng
      Product.belongsTo(models.User, {
        foreignKey: "Users_ID",
        as: "users",
      });

      // Một sản phẩm thuộc về một danh mục (Category)
      Product.belongsTo(models.Category, {
        foreignKey: "Categories_ID",
        as: "categories",
      });
    }
  }

  Product.init(
    {
      Name: DataTypes.STRING,
      Users_ID: DataTypes.INTEGER,
      Categories_ID: DataTypes.INTEGER, // đã sửa tên này
      Description: DataTypes.TEXT,
      Price: DataTypes.FLOAT,
      Stock: DataTypes.INTEGER,
      Image: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "Products", // tên bảng thực tế trong CSDL
      timestamps: true, // nếu bạn sử dụng createdAt/updatedAt
    }
  );

  return Product;
};
