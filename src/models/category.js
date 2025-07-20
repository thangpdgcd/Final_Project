import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Category extends Model {
    static associate(models) {
      // Nếu có bảng Product, bạn có thể thêm quan hệ ở đây:
      // Category.hasMany(models.Product, { foreignKey: "Category_ID", as: "products" });
    }
  }

  Category.init(
    {
      Category_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "Categories", // tên bảng thực tế trong CSDL
      timestamps: false, // nếu bạn không dùng createdAt/updatedAt
    }
  );

  return Category;
};
