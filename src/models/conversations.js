import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Conversations extends Model {
    static associate(models) {
      Conversations.hasMany(models.Messages, {
        foreignKey: "conversationId",
        as: "messages",
      });
    }
  }

  Conversations.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "support",
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "open",
      },
      createdByUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Conversations",
      tableName: "conversations",
      timestamps: true,
    },
  );

  return Conversations;
};

