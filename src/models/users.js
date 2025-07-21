import { Model, DataTypes } from "sequelize";

export default (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      // define association here
    }
  }

  Users.init(
    {
      Users_ID: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      Address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      PhoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
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
