import { Model, DataTypes } from "sequelize";

export default (sequelize, models) => {
  class Carts extends Model {
    static associate(models) {
      // Mỗi giỏ hàng thuộc về 1 người dùng
      Carts.belongsTo(models.Users, {
        foreignKey: "userId",
        targetKey: "userId",
        as: "users", // alias để gọi như: cart.getUser()
      });

      // Mối quan hệ N:M với Products thông qua Cart_Items
      Carts.belongsToMany(models.Products, {
        through: models.Cart_Items,
        as: "products",
        foreignKey: "cartId",
        otherKey: "productId",
      });

      // 1 cart có nhiều cart items
      Carts.hasMany(models.Cart_Items, {
        foreignKey: "cartId",
        as: "cart_Items", // 👈 alias phải trùng
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
