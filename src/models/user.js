// src/models/user.js
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Product, {
        foreignKey: "Users_ID",
        as: "products",
      });
    }
  }

  User.init(
    {
      Name: DataTypes.STRING,
      Email: DataTypes.STRING,
      Address: DataTypes.STRING,
      PhoneNumber: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );

  return User;
};
