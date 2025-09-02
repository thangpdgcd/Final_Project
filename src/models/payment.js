import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Payments extends Model {
    static associate(models) {
      // Payment thuộc về Order_Item
      Payments.belongsTo(models.Order_Items, {
        foreignKey: "orderitem_ID",
        targetKey: "orderitem_ID",
        as: "orderItems",
      });

      // Nếu bạn cần liên kết trực tiếp tới Orders
      Payments.belongsTo(models.Orders, {
        foreignKey: "order_ID",
        targetKey: "order_ID",
        as: "orders",
      });
    }
  }

  Payments.init(
    {
      payment_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderitem_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "orderitem_ID",
          key: "orderitem_ID",
        },
      },
      order_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Orders",
          key: "order_ID",
        },
      },
      payments_method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      payments_status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      transaction_ID: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Payments",
      tableName: "Payments",
      timestamps: false,
    }
  );

  return Payments;
};
