import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Notifications extends Model {
    static associate(models) {
      Notifications.belongsTo(models.Users, {
        foreignKey: "userId",
        targetKey: "userId",
        as: "user",
      });
    }
  }

  Notifications.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "user_ID",
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("order", "chat", "system", "voucher", "email"),
        allowNull: false,
        defaultValue: "system",
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Notifications",
      tableName: "notifications",
      timestamps: true,
    },
  );

  return Notifications;
};

