import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Messages extends Model {
    static associate(models) {
      Messages.belongsTo(models.Conversations, {
        foreignKey: "conversationId",
        as: "conversation",
      });
      Messages.belongsTo(models.Users, {
        foreignKey: "senderUserId",
        as: "sender",
      });
    }
  }

  Messages.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      conversationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM("text", "action"),
        allowNull: false,
        defaultValue: "text",
      },
      text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      action: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Messages",
      tableName: "messages",
      timestamps: true,
    },
  );

  return Messages;
};

