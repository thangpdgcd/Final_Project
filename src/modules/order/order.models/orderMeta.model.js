import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class OrderMeta extends Model {
    static associate(models) {
      OrderMeta.belongsTo(models.Orders, {
        foreignKey: "orderId",
        targetKey: "orderId",
        as: "order",
      });
      OrderMeta.belongsTo(models.Users, {
        foreignKey: "staffId",
        targetKey: "userId",
        as: "staff",
      });
    }
  }

  OrderMeta.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      staffId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "OrderMeta",
      tableName: "order_meta",
      timestamps: true,
      indexes: [
        { fields: ["orderId"], unique: true },
        { fields: ["staffId"] },
      ],
    },
  );

  return OrderMeta;
};
