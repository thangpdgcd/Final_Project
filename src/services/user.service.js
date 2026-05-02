import { AppError } from "../utils/AppError.js";
import { setUserAvatar } from "../utils/userAvatar.js";
import bcrypt from "bcrypt";

export const createUserService = ({ userRepository }) => {
  const updateProfile = async ({ userId, name, phoneNumber, address }) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const patch = {
      name: name || user.name,
      phoneNumber: phoneNumber || user.phoneNumber,
      address: address || user.address,
    };

    const updated = await userRepository.updateById(userId, patch);
    return { user: updated };
  };

  const setAvatar = async ({ userId, avatarUrl }) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const saved = await setUserAvatar({ userId, avatarUrl });
    if (!saved) throw new AppError("Unable to save avatar", 500);
    return { avatarUrl: saved };
  };

  const getWallet = async ({ userId }) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    const walletXu = await userRepository.readWalletXu(userId);
    const transactions = await userRepository.getWalletTxHistory({ userId, limit: 20 });
    return { walletCoin: walletXu, walletXu, transactions };
  };

  const topupWalletByPaypal = async ({ userId, amountXu, paypalCaptureId, note }) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");
    const amount = Number(amountXu);
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new AppError("amountCoin must be a positive number", 400);
    }

    // We only persist reference right now; PayPal server-side verification can be added later.
    const capture = String(paypalCaptureId ?? "").trim();
    if (!capture) throw new AppError("Missing paypalCaptureId", 400);

    const balanceXu = await userRepository.increaseWalletXu({
      userId,
      amountXu: Math.trunc(amount),
    });
    await userRepository.addWalletTx({
      userId,
      type: "TOPUP",
      amountXu: Math.trunc(amount),
      balanceAfter: balanceXu ?? 0,
      source: "PAYPAL",
      referenceId: capture,
      note: note ? String(note) : "PayPal top-up success",
    });
    return {
      walletCoin: balanceXu ?? 0,
      walletXu: balanceXu ?? 0,
      topupCoin: Math.trunc(amount),
      topupXu: Math.trunc(amount),
      paypalCaptureId: capture,
      note: note ? String(note) : "PayPal top-up success",
    };
  };

  const getWalletTransactions = async ({ userId, limit }) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);
    const rows = await userRepository.getWalletTxHistory({ userId, limit: Number(limit) || 50 });
    return { transactions: rows };
  };

  const changePassword = async ({ userId, oldPassword, newPassword, confirmNewPassword }) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError("User not found", 404);

    const oldPw = typeof oldPassword === "string" ? oldPassword : "";
    const newPw = typeof newPassword === "string" ? newPassword : "";
    const confirmPw = typeof confirmNewPassword === "string" ? confirmNewPassword : "";

    if (!oldPw || !newPw) throw new AppError("Old password and new password are required", 400);
    if (newPw.length < 6) throw new AppError("New password must be at least 6 characters", 400);
    if (confirmPw && newPw !== confirmPw) throw new AppError("Confirm password does not match", 400);

    const currentHash = user.password;
    if (!currentHash) throw new AppError("Password is not set for this account", 400);

    const ok = await bcrypt.compare(oldPw, currentHash);
    if (!ok) throw new AppError("Old password is incorrect", 401);

    const nextHash = await bcrypt.hash(newPw, 10);
    await userRepository.updateById(userId, { password: nextHash });
    return { ok: true };
  };

  return {
    updateProfile,
    setAvatar,
    getWallet,
    topupWalletByPaypal,
    getWalletTransactions,
    changePassword,
  };
};

