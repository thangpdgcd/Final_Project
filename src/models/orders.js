import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Orders extends Model {
    static associate(models) {
      Orders.belongsTo(models.Users, {
        foreignKey: "userId",
        targetKey: "userId",
        as: "users",
      });
      Orders.hasMany(models.Order_Items, {
        foreignKey: "orderId",
        as: "order_Items",
      });
    }
  }

  Orders.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "order_ID",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_ID",
      },
      total_Amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      shipping_Address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      paymentMethod: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: "payment_method",
      },
      paymentStatus: {
        type: DataTypes.STRING(32),
        allowNull: true,
        field: "payment_status",
      },
      paymentProvider: {
        type: DataTypes.STRING(64),
        allowNull: true,
        field: "payment_provider",
      },
      paymentRef: {
        type: DataTypes.STRING(128),
        allowNull: true,
        field: "payment_ref",
      },
      paidAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "paid_at",
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
