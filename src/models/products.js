import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Products extends Model {
    static associate(models) {
      Products.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "users",
      });

      Products.belongsTo(models.Categories, {
        foreignKey: "categoriesId",
        targetKey: "categoriesId",
        as: "categories",
      });

      Products.belongsToMany(models.Carts, {
        through: models.Cart_Items,
        as: "carts",
        foreignKey: "productId",
        otherKey: "cartId",
      });
    }
  }
  Products.init(
    {
      productId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "product_ID",
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
        type: DataTypes.TEXT("long"),
        allowNull: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_ID",
      },
      categoriesId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "categories_ID",
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
