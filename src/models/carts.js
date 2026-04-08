import { Model, DataTypes } from "sequelize";

export default (sequelize, models) => {
  class Carts extends Model {
    static associate(models) {
      Carts.belongsTo(models.Users, {
        foreignKey: "userId",
        targetKey: "userId",
        as: "users",
      });

      Carts.belongsToMany(models.Products, {
        through: models.Cart_Items,
        as: "products",
        foreignKey: "cartId",
        otherKey: "productId",
      });

      Carts.hasMany(models.Cart_Items, {
        foreignKey: "cartId",
        as: "cart_Items",
      });
    }
  }

  Carts.init(
    {
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        field: "cart_ID",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_ID",
      },
    },
    {
      sequelize,
      modelName: "Carts",
      tableName: "Carts",
      timestamps: false,
    }
  );

  return Carts;
};
