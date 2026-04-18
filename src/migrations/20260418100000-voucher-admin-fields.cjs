/* eslint-disable */
"use strict";

/** @param {import('sequelize').QueryInterface} queryInterface */
module.exports = {
  async up(queryInterface, Sequelize) {
    const qi = queryInterface;
    const t = await qi.sequelize.transaction();
    try {
      const vouchersTable = await qi.describeTable("vouchers");

      if (!vouchersTable.max_usage) {
        await qi.addColumn(
          "vouchers",
          "max_usage",
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 1,
          },
          { transaction: t },
        );
      }

      if (!vouchersTable.used_count) {
        await qi.addColumn(
          "vouchers",
          "used_count",
          {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0,
          },
          { transaction: t },
        );
      }

      if (!vouchersTable.status) {
        await qi.addColumn(
          "vouchers",
          "status",
          {
            type: Sequelize.ENUM("active", "inactive", "pending"),
            allowNull: false,
            defaultValue: "active",
          },
          { transaction: t },
        );
      }

      if (!vouchersTable.deleted_at) {
        await qi.addColumn(
          "vouchers",
          "deleted_at",
          {
            type: Sequelize.DATE,
            allowNull: true,
          },
          { transaction: t },
        );
      }

      // If the column already existed from a partial run, it may already have data.
      // We only run this update when `used_count` exists.
      const vouchersTableAfterColumns = await qi.describeTable("vouchers");
      if (vouchersTableAfterColumns.used_count) {
        await qi.sequelize.query(
          `UPDATE vouchers SET used_count = CASE WHEN used_at IS NOT NULL THEN 1 ELSE 0 END`,
          { transaction: t },
        );
      }

      // MySQL requires the column to be nullable before creating an FK with ON DELETE SET NULL.
      await qi.changeColumn(
        "vouchers",
        "user_id",
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction: t },
      );

      const [fkRows] = await qi.sequelize.query(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.KEY_COLUMN_USAGE
         WHERE TABLE_SCHEMA = DATABASE()
           AND TABLE_NAME = 'vouchers'
           AND COLUMN_NAME = 'user_id'
           AND REFERENCED_TABLE_NAME IS NOT NULL`,
        { transaction: t },
      );

      const existingFkName = fkRows?.[0]?.CONSTRAINT_NAME;
      if (existingFkName) {
        await qi.sequelize.query(`ALTER TABLE vouchers DROP FOREIGN KEY \`${existingFkName}\``, {
          transaction: t,
        });
      }

      // If the named FK already exists (due to a partial migration), don't try to add it again.
      const [namedFkRows] = await qi.sequelize.query(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.TABLE_CONSTRAINTS
         WHERE CONSTRAINT_SCHEMA = DATABASE()
           AND TABLE_NAME = 'vouchers'
           AND CONSTRAINT_NAME = 'vouchers_user_id_fk'
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        { transaction: t },
      );

      if (!namedFkRows?.length) {
        await qi.addConstraint("vouchers", {
          fields: ["user_id"],
          type: "foreign key",
          name: "vouchers_user_id_fk",
          references: {
            table: "Users",
            field: "user_ID",
          },
          onUpdate: "CASCADE",
          onDelete: "SET NULL",
          transaction: t,
        });
      }

      const existingIndexes = await qi.showIndex("vouchers", { transaction: t });
      const indexNames = new Set(existingIndexes.map((i) => i.name));

      if (!indexNames.has("vouchers_status_idx")) {
        await qi.addIndex("vouchers", ["status"], { name: "vouchers_status_idx", transaction: t });
      }
      if (!indexNames.has("vouchers_deleted_at_idx")) {
        await qi.addIndex("vouchers", ["deleted_at"], { name: "vouchers_deleted_at_idx", transaction: t });
      }

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },

  async down(queryInterface, Sequelize) {
    const qi = queryInterface;
    const t = await qi.sequelize.transaction();
    try {
      const existingIndexes = await qi.showIndex("vouchers", { transaction: t });
      const indexNames = new Set(existingIndexes.map((i) => i.name));

      if (indexNames.has("vouchers_deleted_at_idx")) {
        await qi.removeIndex("vouchers", "vouchers_deleted_at_idx", { transaction: t });
      }
      if (indexNames.has("vouchers_status_idx")) {
        await qi.removeIndex("vouchers", "vouchers_status_idx", { transaction: t });
      }

      // Drop the explicit FK added in `up` (if present).
      const [namedFkRows] = await qi.sequelize.query(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.TABLE_CONSTRAINTS
         WHERE CONSTRAINT_SCHEMA = DATABASE()
           AND TABLE_NAME = 'vouchers'
           AND CONSTRAINT_NAME = 'vouchers_user_id_fk'
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        { transaction: t },
      );
      if (namedFkRows?.length) {
        await qi.removeConstraint("vouchers", "vouchers_user_id_fk", { transaction: t });
      }

      await qi.changeColumn(
        "vouchers",
        "user_id",
        {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        { transaction: t },
      );

      // Restore original FK behavior (from the table-creation migration).
      const [namedFkRowsAfter] = await qi.sequelize.query(
        `SELECT CONSTRAINT_NAME
         FROM information_schema.TABLE_CONSTRAINTS
         WHERE CONSTRAINT_SCHEMA = DATABASE()
           AND TABLE_NAME = 'vouchers'
           AND CONSTRAINT_NAME = 'vouchers_user_id_fk'
           AND CONSTRAINT_TYPE = 'FOREIGN KEY'`,
        { transaction: t },
      );
      if (!namedFkRowsAfter?.length) {
        await qi.addConstraint("vouchers", {
          fields: ["user_id"],
          type: "foreign key",
          name: "vouchers_user_id_fk",
          references: {
            table: "Users",
            field: "user_ID",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
          transaction: t,
        });
      }

      const vouchersTable = await qi.describeTable("vouchers");
      if (vouchersTable.deleted_at) await qi.removeColumn("vouchers", "deleted_at", { transaction: t });
      if (vouchersTable.status) await qi.removeColumn("vouchers", "status", { transaction: t });
      if (vouchersTable.used_count) await qi.removeColumn("vouchers", "used_count", { transaction: t });
      if (vouchersTable.max_usage) await qi.removeColumn("vouchers", "max_usage", { transaction: t });

      await t.commit();
    } catch (e) {
      await t.rollback();
      throw e;
    }
  },
};
