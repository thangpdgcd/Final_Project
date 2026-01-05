import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Products extends Model {
    static associate(models) {
      Products.belongsTo(models.Users, {
        foreignKey: "user_ID",
        as: "users",
      });

      Products.belongsTo(models.Categories, {
        foreignKey: "categories_ID",
        targetKey: "categories_ID",
        as: "categories",
      });

      Products.belongsToMany(models.Carts, {
        through: models.Cart_Items,
        as: "carts",
        foreignKey: "product_ID",
        otherKey: "cart_ID",
      });
    }
  }
  Products.init(
    {
      product_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_ID: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categories_ID: {
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
