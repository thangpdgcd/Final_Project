import db from "../models/index.js";

const { sequelize, Users } = db;

let ensureWalletColumnPromise = null;
let ensureWalletTxTablePromise = null;

const ensureWalletCoinColumn = async () => {
  if (!ensureWalletColumnPromise) {
    ensureWalletColumnPromise = (async () => {
      const qi = sequelize.getQueryInterface();
      const desc = await qi.describeTable("Users");

      if (!desc.wallet_coin) {
        await qi.addColumn("Users", "wallet_coin", {
          type: db.Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        });
      }

      // Backfill from legacy column names if present.
      if (desc.wallet_xu) {
        await sequelize.query(
          "UPDATE Users SET wallet_coin = GREATEST(COALESCE(wallet_coin, 0), COALESCE(wallet_xu, 0))"
        );
      }
      if (desc.wallet_Xu) {
        await sequelize.query(
          "UPDATE Users SET wallet_coin = GREATEST(COALESCE(wallet_coin, 0), COALESCE(wallet_Xu, 0))"
        );
      }
    })();
  }
  await ensureWalletColumnPromise;
};

const ensureWalletTransactionsTable = async () => {
  if (!ensureWalletTxTablePromise) {
    ensureWalletTxTablePromise = (async () => {
      const qi = sequelize.getQueryInterface();
      const tables = await qi.showAllTables();
      const names = Array.isArray(tables)
        ? tables.map((t) => (typeof t === "string" ? t : t?.tableName || t?.TABLE_NAME || "")).map(String)
        : [];
      if (!names.some((n) => n.toLowerCase() === "wallet_transactions")) {
        await qi.createTable("wallet_transactions", {
          id: {
            type: db.Sequelize.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: db.Sequelize.INTEGER,
            allowNull: false,
          },
          type: {
            type: db.Sequelize.STRING(32),
            allowNull: false,
          },
          amount_xu: {
            type: db.Sequelize.INTEGER,
            allowNull: false,
          },
          balance_after: {
            type: db.Sequelize.INTEGER,
            allowNull: false,
          },
          source: {
            type: db.Sequelize.STRING(64),
            allowNull: true,
          },
          reference_id: {
            type: db.Sequelize.STRING(128),
            allowNull: true,
          },
          note: {
            type: db.Sequelize.STRING(255),
            allowNull: true,
          },
          createdAt: {
            type: db.Sequelize.DATE,
            allowNull: false,
            defaultValue: db.Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          updatedAt: {
            type: db.Sequelize.DATE,
            allowNull: false,
            defaultValue: db.Sequelize.literal("CURRENT_TIMESTAMP"),
          },
        });
      }
    })();
  }
  await ensureWalletTxTablePromise;
};

const normalizeXu = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.trunc(n));
};

export const getWalletXu = async (userId) => {
  await ensureWalletCoinColumn();
  await ensureWalletTransactionsTable();
  const user = await Users.findByPk(userId);
  if (!user) return 0;
  const [rows] = await sequelize.query(
    "SELECT wallet_coin AS walletXu FROM Users WHERE user_ID = :uid LIMIT 1",
    { replacements: { uid: userId } }
  );
  return normalizeXu(rows?.[0]?.walletXu ?? 0);
};

export const addWalletCoin = async ({ userId, amountXu }) => {
  await ensureWalletCoinColumn();
  await ensureWalletTransactionsTable();
  const delta = normalizeXu(amountXu);
  const user = await Users.findByPk(userId);
  if (!user) return null;
  const current = await getWalletXu(userId);
  const next = normalizeXu(current + delta);
  await sequelize.query(
    "UPDATE Users SET wallet_coin = :next WHERE user_ID = :uid",
    { replacements: { next, uid: userId } }
  );
  return next;
};

export const recordWalletTransaction = async ({
  userId,
  type,
  amountXu,
  balanceAfter,
  source,
  referenceId,
  note,
}) => {
  await ensureWalletTransactionsTable();
  await sequelize.query(
    `INSERT INTO wallet_transactions
      (user_id, type, amount_xu, balance_after, source, reference_id, note, createdAt, updatedAt)
     VALUES
      (:userId, :type, :amountXu, :balanceAfter, :source, :referenceId, :note, NOW(), NOW())`,
    {
      replacements: {
        userId: Number(userId),
        type: String(type || "UNKNOWN"),
        amountXu: normalizeXu(amountXu),
        balanceAfter: normalizeXu(balanceAfter),
        source: source != null ? String(source) : null,
        referenceId: referenceId != null ? String(referenceId) : null,
        note: note != null ? String(note) : null,
      },
    }
  );
};

export const listWalletTransactions = async ({ userId, limit = 20 }) => {
  await ensureWalletTransactionsTable();
  const safeLimit = Math.max(1, Math.min(100, Math.trunc(Number(limit) || 20)));
  const [rows] = await sequelize.query(
    `SELECT id, user_id AS userId, type, amount_xu AS amountXu, balance_after AS balanceAfter,
            amount_xu AS amountCoin, balance_after AS balanceCoin,
            source, reference_id AS referenceId, note, createdAt
     FROM wallet_transactions
     WHERE user_id = :userId
     ORDER BY id DESC
     LIMIT :lim`,
    {
      replacements: { userId: Number(userId), lim: safeLimit },
    }
  );
  return Array.isArray(rows) ? rows : [];
};

export default {
  ensureWalletCoinColumn,
  getWalletXu,
  addWalletCoin,
  recordWalletTransaction,
  listWalletTransactions,
};
