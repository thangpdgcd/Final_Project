export default (sequelize, DataTypes) => {
  const Vouchers = sequelize.define(
    "Vouchers",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      code: {
        type: DataTypes.STRING(32),
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "user_id",
      },
      type: {
        type: DataTypes.ENUM("fixed", "percent"),
        allowNull: false,
      },
      value: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
      },
      maxDiscountValue: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        field: "max_discount_value",
      },
      maxUsage: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: "max_usage",
      },
      usedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "used_count",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "pending"),
        allowNull: false,
        defaultValue: "active",
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "expires_at",
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "deleted_at",
      },
      createdByStaffId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "created_by_staff_id",
      },
      usedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "used_at",
      },
      usedOrderId: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "used_order_id",
      },
    },
    {
      tableName: "vouchers",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );

  Vouchers.associate = (models) => {
    if (models?.Users) {
      Vouchers.belongsTo(models.Users, {
        foreignKey: "userId",
        targetKey: "userId",
        as: "user",
      });
      Vouchers.belongsTo(models.Users, {
        foreignKey: "createdByStaffId",
        targetKey: "userId",
        as: "createdByStaff",
      });
    }
  };

  return Vouchers;
};
