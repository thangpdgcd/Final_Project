export default (sequelize, DataTypes) => {
  const VoucherAuditLogs = sequelize.define(
    "VoucherAuditLogs",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      voucherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "voucher_id",
      },
      action: {
        type: DataTypes.ENUM("create", "send", "redeem", "expire"),
        allowNull: false,
      },
      staffId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "staff_id",
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "user_id",
      },
      meta: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      tableName: "voucher_audit_logs",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  VoucherAuditLogs.associate = (models) => {
    if (models?.Vouchers) {
      VoucherAuditLogs.belongsTo(models.Vouchers, {
        foreignKey: "voucherId",
        as: "voucher",
      });
    }
    if (models?.Users) {
      VoucherAuditLogs.belongsTo(models.Users, {
        foreignKey: "staffId",
        targetKey: "userId",
        as: "staff",
      });
      VoucherAuditLogs.belongsTo(models.Users, {
        foreignKey: "userId",
        targetKey: "userId",
        as: "user",
      });
    }
  };

  return VoucherAuditLogs;
};

