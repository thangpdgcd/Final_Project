import { Model, DataTypes } from "sequelize";

export default (sequelize, models) => {
  class Carts extends Model {
    static associate(models) {
      // Mỗi giỏ hàng thuộc về 1 người dùng
      Carts.belongsTo(models.Users, {
        foreignKey: "user_ID",
        targetKey: "user_ID",
        as: "users", // alias để gọi như: cart.getUser()
      });

      // Mối quan hệ N:M với Products thông qua Cart_Items
      Carts.belongsToMany(models.Products, {
        through: models.Cart_Items,
        as: "products",
        foreignKey: "cart_ID",
        otherKey: "product_ID",
      });

      // 1 cart có nhiều cart items
      Carts.hasMany(models.Cart_Items, {
        foreignKey: "cart_ID",
        as: "cart_Items", // 👈 alias phải trùng
      });
    }
  }

  Carts.init(
    {
      cart_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      user_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
