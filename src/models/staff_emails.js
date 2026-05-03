import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class StaffEmails extends Model {
    static associate(models) {
      StaffEmails.belongsTo(models.Users, {
        foreignKey: "toUserId",
        targetKey: "userId",
        as: "toUser",
      });
      StaffEmails.belongsTo(models.Users, {
        foreignKey: "fromStaffId",
        targetKey: "userId",
        as: "fromStaff",
      });
    }
  }

  StaffEmails.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      toUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "to_user_id",
      },
      fromStaffId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "from_staff_id",
      },
      toEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        field: "to_email",
      },
      subject: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      readAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "read_at",
      },
      status: {
        type: DataTypes.ENUM("queued", "sent", "failed"),
        allowNull: false,
        defaultValue: "sent",
      },
      contentLocale: {
        type: DataTypes.STRING(8),
        allowNull: true,
        field: "content_locale",
      },
    },
    {
      sequelize,
      modelName: "StaffEmails",
      tableName: "staff_emails",
      timestamps: true,
      indexes: [
        { fields: ["to_user_id"] },
        { fields: ["to_user_id", "read_at"] },
        { fields: ["createdAt"] },
      ],
    },
  );

  return StaffEmails;
};

