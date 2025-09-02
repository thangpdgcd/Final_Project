import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Carts extends Model {
    static associate(models) {
      // Mỗi giỏ hàng thuộc về 1 người dùng
      Carts.belongsTo(models.Users, {
        foreignKey: "user_ID",
        targetKey: "user_ID",
        as: "users", // alias để gọi như: cart.getUser()
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
      userID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Carts",
      tableName: "Carts", // chú ý: nên dùng số nhiều nếu theo chuẩn Sequelize CLI
      timestamps: false, // nếu không dùng createdAt / updatedAt
    }
  );

  return Carts;
};
