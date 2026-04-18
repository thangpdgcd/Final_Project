export default (sequelize, DataTypes) => {
  const PromoVouchers = sequelize.define(
    "PromoVouchers",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      code: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      discountType: {
        type: DataTypes.ENUM("percentage", "fixed"),
        allowNull: false,
        field: "discount_type",
      },
      discountValue: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        field: "discount_value",
      },
      minOrderValue: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        field: "min_order_value",
      },
      maxDiscountValue: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: true,
        field: "max_discount_value",
      },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      usedCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: "used_count",
      },
      startDate: { type: DataTypes.DATE, allowNull: false, field: "start_date" },
      endDate: { type: DataTypes.DATE, allowNull: false, field: "end_date" },
      isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, field: "is_active" },
      createdBy: { type: DataTypes.STRING(16), allowNull: false, defaultValue: "admin", field: "created_by" },
      applicableUsers: {
        type: DataTypes.ENUM("all", "new_user", "specific"),
        allowNull: false,
        defaultValue: "all",
        field: "applicable_users",
      },
      specificUsers: { type: DataTypes.JSON, allowNull: true, field: "specific_users" },
      createdByUserId: { type: DataTypes.INTEGER, allowNull: true, field: "created_by_user_id" },
    },
    {
      tableName: "promo_vouchers",
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  )

  PromoVouchers.associate = (models) => {
    if (models?.Users) {
      PromoVouchers.belongsTo(models.Users, {
        foreignKey: "createdByUserId",
        targetKey: "userId",
        as: "createdByUser",
      })
    }
  }

  return PromoVouchers
}

