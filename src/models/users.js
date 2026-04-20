// models/users.js
import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Users extends Model {
    static associate(models) {
      Users.hasMany(models.Orders, { foreignKey: "userId", as: "orders" });
      Users.hasOne(models.Carts, { foreignKey: "userId", as: "carts" });
    }
  }

  const normalizeRoleID = (value) => {
    if (value == null) return value;
    const v = String(value).trim().toLowerCase();
    if (!v) return value;

    if (v === "1" || v === "user" || v === "customer") return "1";
    if (v === "2" || v === "admin") return "2";
    if (v === "3" || v === "staff") return "3";

    return value;
  };

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
      avatar: {
        type: DataTypes.STRING(1024),
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING(32),
        allowNull: true,
      },
      roleID: {
        type: DataTypes.STRING,
        allowNull: false,
        set(value) {
          this.setDataValue("roleID", normalizeRoleID(value));
        },
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
