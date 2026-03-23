import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Categories extends Model {
    static associate(models) {
      Categories.hasMany(models.CategoryDetail, {
        foreignKey: "categoriesId",
        sourceKey: "categoriesId",
        as: "categoryDetails",
      });
    }
  }

  Categories.init(
    {
      categoriesId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "categories_ID",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Categories",
      tableName: "Categories", // tên bảng thực tế trong CSDL
      timestamps: false, // nếu bạn không dùng createdAt/updatedAt
    }
  );

  return Categories;
};
