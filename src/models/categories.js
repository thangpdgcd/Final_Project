import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Categories extends Model {
    static associate(models) {}
  }

  Categories.init(
    {
      Categories_ID: {
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
      modelName: "Categories",
      tableName: "Categories", // tên bảng thực tế trong CSDL
      timestamps: false, // nếu bạn không dùng createdAt/updatedAt
    }
  );

  return Categories;
};
