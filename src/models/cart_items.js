import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Cart_Items extends Model {
    static associate(models) {
      // Mỗi Cart_Item thuộc về một Cart
      Cart_Items.belongsTo(models.Carts, {
        foreignKey: "cartId",
        targetKey: "cartId",
        as: "carts",
      });

      // Mỗi Cart_Item thuộc về một Product
      Cart_Items.belongsTo(models.Products, {
        foreignKey: "productId",
        targetKey: "productId",
        as: "products",
      });
    }
  }

  Cart_Items.init(
    {
      cartItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        field: "cartitem_ID",
      },
      cartId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "cart_ID",
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
