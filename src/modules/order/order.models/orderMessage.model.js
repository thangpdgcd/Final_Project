import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class OrderMessages extends Model {
    static associate(models) {
      OrderMessages.belongsTo(models.Orders, {
        foreignKey: "orderId",
        targetKey: "orderId",
        as: "order",
      });
      OrderMessages.belongsTo(models.Users, {
        foreignKey: "senderId",
        targetKey: "userId",
        as: "sender",
      });
    }
  }

  OrderMessages.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "OrderMessages",
      tableName: "order_messages",
      timestamps: true,
      indexes: [
        { fields: ["orderId"] },
        { fields: ["senderId"] },
      ],
    },
  );

  return OrderMessages;
};
