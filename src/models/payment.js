import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Payments extends Model {
    static associate(models) {
      // Payment thuộc về Order_Item
      Payments.belongsTo(models.Order_Items, {
        foreignKey: "Order_Items_ID",
        targetKey: "Order_Items_ID",
        as: "orderItems",
      });

      // Nếu bạn cần liên kết trực tiếp tới Orders
      Payments.belongsTo(models.Orders, {
        foreignKey: "Orders_ID",
        targetKey: "Orders_ID",
        as: "orders",
      });
    }
  }

  Payments.init(
    {
      Payments_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Order_Items_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Order_Items",
          key: "Order_Item_ID",
        },
      },
      Orders_ID: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "Orders",
          key: "Orders_ID",
        },
      },
      Payments_Method: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Payments_Status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      Paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      Transaction_ID: {
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
