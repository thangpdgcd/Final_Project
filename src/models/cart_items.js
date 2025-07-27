import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Cart_Items extends Model {
    static associate(models) {
      // Mỗi Cart_Item thuộc về một Cart
      Cart_Items.belongsTo(models.Carts, {
        foreignKey: "Carts_ID",
        targetKey: "Carts_ID",
        as: "carts",
      });

      // Mỗi Cart_Item thuộc về một Product
      Cart_Items.belongsTo(models.Products, {
        foreignKey: "Products_ID",
        targetKey: "Products_ID",
        as: "products",
      });
    }
  }

  Cart_Items.init(
    {
      Cart_Items_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      Carts_ID: {
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
      Price_At_Added: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Cart_Items",
      tableName: "Cart_Items",
      timestamps: false,
    }
  );

  return Cart_Items;
};
