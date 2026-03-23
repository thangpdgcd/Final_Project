// models/users.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Orders, { foreignKey: "userId", as: "orders" });
      Users.hasOne(models.Carts, { foreignKey: "userId", as: "carts" });
    }
  }

  Users.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "user_ID",
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
