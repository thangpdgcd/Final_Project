import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Orders extends Model {
    static associate(models) {
      // Mỗi đơn hàng thuộc về một người dùng
      Orders.belongsTo(models.Users, {
        foreignKey: "User_ID",
        targetKey: "Users_ID", // vì Users có khóa chính là Users_ID
        as: "users",
      });
    }
  }

  Orders.init(
    {
      Orders_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      User_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Total_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      Status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      Shipping_Address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Orders",
      tableName: "Orders",
      timestamps: true,
    }
  );

  return Orders;
};
