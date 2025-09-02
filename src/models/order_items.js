import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Order_Items extends Model {
    static associate(models) {
      // Liên kết với bảng Orders
      Order_Items.belongsTo(models.Orders, {
        foreignKey: "order_ID",
        targetKey: "order_ID",
        as: "orders",
      });

      // Liên kết với bảng Products
      Order_Items.belongsTo(models.Products, {
        foreignKey: "product_ID",
        targetKey: "product_ID", // đúng tên khóa chính của bảng Products
        as: "products",
      });
    }
  }

  Order_Items.init(
    {
      orderitem_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      order_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      product_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
