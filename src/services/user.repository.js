import models from "../models/index.js";
import {
  getWalletCoin,
  getWalletXu,
  addWalletCoin,
  recordWalletTransaction,
  listWalletTransactions,
} from "../utils/walletCoin.js";

const { Users } = models;

export const createUserRepository = () => {
  const findById = async (id) => Users.findByPk(id);

  const updateById = async (id, patch) => {
    const user = await Users.findByPk(id);
    if (!user) return null;
    await user.update(patch);
    return user;
  };

  const readWalletCoin = async (userId) => getWalletCoin(userId);
  const increaseWalletCoin = async ({ userId, amountXu }) =>
    addWalletCoin({ userId, amountXu });

  // Backward-compatible aliases (legacy naming)
  const readWalletXu = async (userId) => getWalletXu(userId);
  const increaseWalletXu = async ({ userId, amountXu }) =>
    increaseWalletCoin({ userId, amountXu });
  const addWalletTx = async (payload) => recordWalletTransaction(payload);
  const getWalletTxHistory = async ({ userId, limit }) =>
    listWalletTransactions({ userId, limit });

  return {
    findById,
    updateById,
    readWalletCoin,
    increaseWalletCoin,
    readWalletXu,
    increaseWalletXu,
    addWalletTx,
    getWalletTxHistory,
  };
};

