import models from "../models/index.js";
import {
  getWalletXu,
  addWalletXu,
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

  const readWalletXu = async (userId) => getWalletXu(userId);
  const increaseWalletXu = async ({ userId, amountXu }) =>
    addWalletXu({ userId, amountXu });
  const addWalletTx = async (payload) => recordWalletTransaction(payload);
  const getWalletTxHistory = async ({ userId, limit }) =>
    listWalletTransactions({ userId, limit });

  return {
    findById,
    updateById,
    readWalletXu,
    increaseWalletXu,
    addWalletTx,
    getWalletTxHistory,
  };
};

