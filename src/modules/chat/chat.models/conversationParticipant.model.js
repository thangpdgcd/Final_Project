import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class ConversationParticipants extends Model {
    static associate(models) {
      ConversationParticipants.belongsTo(models.Conversations, {
        foreignKey: "conversationId",
        as: "conversation",
      });
      ConversationParticipants.belongsTo(models.Users, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  ConversationParticipants.init(
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
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      roleAtJoin: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "ConversationParticipants",
      tableName: "conversation_participants",
      timestamps: true,
    },
  );

  return ConversationParticipants;
};

