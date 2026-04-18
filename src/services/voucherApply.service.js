import models from "../models/index.js"
import { AppError } from "../utils/AppError.js"

const { PromoVouchers, Orders, sequelize } = models
const { Op } = models.Sequelize

const toMoney = (raw) => {
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

const nowBetween = (now, start, end) => {
  const s = new Date(start).getTime()
  const e = new Date(end).getTime()
  const t = now.getTime()
  return Number.isFinite(s) && Number.isFinite(e) && t >= s && t <= e
}

const computeDiscount = ({ discountType, discountValue, maxDiscountValue, orderValue }) => {
  const base = Math.max(0, Number(orderValue) || 0)
  if (base <= 0) return { discountAmount: 0, finalPrice: 0 }

  if (discountType === "percentage") {
    const pct = Math.min(100, Math.max(0, Number(discountValue) || 0))
    let amount = (base * pct) / 100
    const cap = maxDiscountValue != null ? Math.max(0, Number(maxDiscountValue) || 0) : null
    if (cap != null) amount = Math.min(amount, cap)
    amount = Math.min(amount, base)
    return { discountAmount: amount, finalPrice: base - amount }
  }

  const fixed = Math.max(0, Number(discountValue) || 0)
  const amount = Math.min(fixed, base)
  return { discountAmount: amount, finalPrice: base - amount }
}

export const voucherApplyService = {
  apply: async ({ code, orderValue, userId }) => {
    const voucherCode = String(code ?? "").trim().toUpperCase()
    if (!voucherCode) throw new AppError("code is required", 400)

    const ov = toMoney(orderValue)
    if (ov == null || ov < 0) throw new AppError("orderValue must be a number >= 0", 400)

    const uid =
      userId != null && String(userId).trim() !== "" ? Math.trunc(Number(userId)) : null
    if (uid != null && (!Number.isFinite(uid) || uid <= 0)) {
      throw new AppError("userId must be a positive integer", 400)
    }

    const row = await PromoVouchers.findOne({ where: { code: voucherCode } })
    if (!row) throw new AppError("Voucher not found", 404)

    const v = row.toJSON ? row.toJSON() : row

    if (!v.isActive) throw new AppError("Voucher is inactive", 400)

    const now = new Date()
    if (!nowBetween(now, v.startDate, v.endDate)) {
      throw new AppError("Voucher is not in valid date range", 400)
    }

    const qty = Number(v.quantity ?? 0) || 0
    const used = Number(v.usedCount ?? 0) || 0
    if (qty <= 0) throw new AppError("Voucher is out of stock", 400)
    if (used >= qty) throw new AppError("Voucher usage limit reached", 400)

    const min = v.minOrderValue != null ? Number(v.minOrderValue) : null
    if (min != null && ov < min) throw new AppError("Order value does not meet minimum requirement", 400)

    const au = String(v.applicableUsers ?? "all")
    if (au === "specific") {
      if (uid == null) throw new AppError("userId is required for this voucher", 400)
      const allowed = Array.isArray(v.specificUsers) ? v.specificUsers.map(String) : []
      if (!allowed.includes(String(uid))) throw new AppError("Voucher is not applicable for this user", 403)
    }

    if (au === "new_user") {
      if (uid == null) throw new AppError("userId is required for this voucher", 400)
      const count = await Orders.count({ where: { userId: uid } })
      if (Number(count) > 0) throw new AppError("Voucher is only applicable for new users", 403)
    }

    const { discountAmount, finalPrice } = computeDiscount({
      discountType: v.discountType,
      discountValue: v.discountValue,
      maxDiscountValue: v.maxDiscountValue,
      orderValue: ov,
    })

    // Atomic increment usedCount (and enforce usedCount < quantity) in a transaction
    await sequelize.transaction(async (tx) => {
      const [affected] = await PromoVouchers.update(
        { usedCount: sequelize.literal("used_count + 1") },
        {
          where: {
            id: v.id,
            isActive: true,
            usedCount: { [Op.lt]: qty },
          },
          transaction: tx,
        },
      )
      if (!affected) throw new AppError("Voucher just reached its usage limit", 409)
    })

    return {
      finalPrice,
      discountAmount,
      voucher: {
        code: voucherCode,
        discountType: v.discountType,
        discountValue: Number(v.discountValue),
        maxDiscountValue: v.maxDiscountValue != null ? Number(v.maxDiscountValue) : null,
      },
    }
  },
}

