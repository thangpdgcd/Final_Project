// models/users.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Orders, { foreignKey: "user_ID", as: "orders" });
      Users.hasOne(models.Carts, { foreignKey: "user_ID", as: "carts" });
    }
  }

  Users.init(
    {
      user_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING,
      },
      email: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
      },
      roleID: {
        type: DataTypes.STRING, // "1" for user, "2" for admin, "3" for manager
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Users",
      tableName: "Users",
      timestamps: true,
    }
  );

  return Users;
};
