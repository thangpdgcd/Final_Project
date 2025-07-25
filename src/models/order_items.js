import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Order_Items extends Model {
    static associate(models) {
      // Liên kết với bảng Orders
      Order_Items.belongsTo(models.Orders, {
        foreignKey: "Orders_ID",
        targetKey: "Orders_ID",
        as: "orders",
      });

      // Liên kết với bảng Products
      Order_Items.belongsTo(models.Products, {
        foreignKey: "Products_ID",
        targetKey: "Products_ID", // đúng tên khóa chính của bảng Products
        as: "products",
      });
    }
  }

  Order_Items.init(
    {
      Order_Items_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      Orders_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Products_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      Price: {
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
