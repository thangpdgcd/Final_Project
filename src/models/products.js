import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Products extends Model {
    static associate(models) {
      Products.belongsTo(models.User, {
        foreignKey: "Users_ID",
        as: "users",
      });

      Products.belongsTo(models.Categories, {
        foreignKey: "Categories_ID",
        targetKey: "Categories_ID",
        as: "categories",
      });
    }
  }
  Products.init(
    {
      Products_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      Price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      Stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Users_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Categories_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Products",
      tableName: "Products", // đúng với bảng trong DB
      timestamps: true,
    }
  );

  return Products;
};
