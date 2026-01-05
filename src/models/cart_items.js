import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Cart_Items extends Model {
    static associate(models) {
      // Mỗi Cart_Item thuộc về một Cart
      Cart_Items.belongsTo(models.Carts, {
        foreignKey: "cart_ID",
        targetKey: "cart_ID",
        as: "carts",
      });

      // Mỗi Cart_Item thuộc về một Product
      Cart_Items.belongsTo(models.Products, {
        foreignKey: "product_ID",
        targetKey: "product_ID",
        as: "products",
      });
    }
  }

  Cart_Items.init(
    {
      cartitem_ID: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      cart_ID: {
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
