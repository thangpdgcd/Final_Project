import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Order_Items extends Model {
    static associate(models) {
      // Liên kết với bảng Orders
      Order_Items.belongsTo(models.Orders, {
        foreignKey: "orderId",
        targetKey: "orderId",
        as: "orders",
      });

      // Liên kết với bảng Products
      Order_Items.belongsTo(models.Products, {
        foreignKey: "productId",
        targetKey: "productId",
        as: "products",
      });
    }
  }

  Order_Items.init(
    {
      orderItemId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        field: "orderitem_ID",
      },
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "order_ID",
      },
      productId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "product_ID",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Order_Items",
      tableName: "Order_Items",
      timestamps: true,
    }
  );

  return Order_Items;
};
