import { Model, DataTypes } from "sequelize";

/**
 * Tin nhắn trên luồng đơn hàng (order chat). Khác với bảng `messages` (hội thoại chat).
 * Dữ liệu lưu ở bảng `order_messages` — không đổi tableName để tránh lệch dữ liệu.
 */
export default (sequelize) => {
  class OrderChatMessage extends Model {
    static associate(models) {
      OrderChatMessage.belongsTo(models.Orders, {
        foreignKey: "orderId",
        targetKey: "orderId",
        as: "order",
      });
      OrderChatMessage.belongsTo(models.Users, {
        foreignKey: "senderId",
        targetKey: "userId",
        as: "sender",
      });
    }
  }

  OrderChatMessage.init(
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
      modelName: "OrderChatMessage",
      tableName: "order_messages",
      timestamps: true,
      indexes: [
        { fields: ["orderId"] },
        { fields: ["senderId"] },
      ],
    },
  );

  return OrderChatMessage;
};
