import models from "../models/index.js"
import { AppError } from "../utils/AppError.js"

const { PromoVouchers, sequelize } = models
const { Op } = models.Sequelize

const toNumber = (raw) => {
  const n = Number(raw)
  return Number.isFinite(n) ? n : null
}

const toPositiveNumber = (raw) => {
  const n = toNumber(raw)
  return n != null && n > 0 ? n : null
}

const toNonNegativeInt = (raw) => {
  const n = Math.trunc(Number(raw))
  return Number.isFinite(n) && n >= 0 ? n : null
}

const normalizeCode = (code) => String(code ?? "").trim().toUpperCase()

const isExpired = (v) => {
  const end = v?.endDate ? new Date(v.endDate).getTime() : 0
  const now = Date.now()
  if (end && end < now) return true
  const qty = Number(v?.quantity ?? 0) || 0
  const used = Number(v?.usedCount ?? 0) || 0
  return qty >= 0 && used >= qty
}

const serialize = (row) => {
  const j = row?.toJSON ? row.toJSON() : row
  return {
    id: j.id,
    code: j.code,
    discountType: j.discountType,
    discountValue: Number(j.discountValue),
    minOrderValue: j.minOrderValue != null ? Number(j.minOrderValue) : null,
    maxDiscountValue: j.maxDiscountValue != null ? Number(j.maxDiscountValue) : null,
    quantity: Number(j.quantity ?? 0) || 0,
    usedCount: Number(j.usedCount ?? 0) || 0,
    startDate: j.startDate,
    endDate: j.endDate,
    isActive: Boolean(j.isActive),
    createdBy: j.createdBy,
    applicableUsers: j.applicableUsers,
    specificUsers: Array.isArray(j.specificUsers) ? j.specificUsers : [],
    createdByUserId: j.createdByUserId ?? null,
    createdAt: j.createdAt,
    updatedAt: j.updatedAt,
    expired: isExpired(j),
  }
}

export const promoVoucherService = {
  list: async (query = {}) => {
    const page = Math.max(1, Number(query.page) || 1)
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20))
    const offset = (page - 1) * pageSize

    const where = {}
    const q = String(query.q ?? query.search ?? "").trim()
    if (q) where.code = { [Op.like]: `%${q.toUpperCase()}%` }

    const filter = String(query.filter ?? query.status ?? "all").trim().toLowerCase()
    const now = new Date()
    if (filter === "active") {
      where.isActive = true
      where.startDate = { [Op.lte]: now }
      where.endDate = { [Op.gte]: now }
      // Sequelize aliases the table as `PromoVouchers` in generated SQL.
      where[Op.and] = sequelize.literal("`PromoVouchers`.`used_count` < `PromoVouchers`.`quantity`")
    } else if (filter === "expired") {
      where[Op.or] = [
        { endDate: { [Op.lt]: now } },
        sequelize.literal("`PromoVouchers`.`used_count` >= `PromoVouchers`.`quantity`"),
      ]
    } else if (filter === "inactive") {
      where.isActive = false
    }

    const { rows, count } = await PromoVouchers.findAndCountAll({
      where,
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      distinct: true,
    })

    return { items: rows.map(serialize), total: count, page, pageSize }
  },

  getById: async (id) => {
    const vid = Number(id)
    if (!Number.isFinite(vid) || vid <= 0) throw new AppError("Invalid voucher id", 400)
    const row = await PromoVouchers.findByPk(vid)
    if (!row) throw new AppError("Voucher not found", 404)
    return serialize(row)
  },

  create: async (input, { createdByUserId } = {}) => {
    const code = normalizeCode(input.code)
    if (!code) throw new AppError("code is required", 400)

    const dup = await PromoVouchers.findOne({ where: { code } })
    if (dup) throw new AppError("code must be unique", 409)

    const discountType = input.discountType
    if (discountType !== "percentage" && discountType !== "fixed") {
      throw new AppError("discountType must be percentage or fixed", 400)
    }

    const discountValue = toPositiveNumber(input.discountValue)
    if (discountValue == null) throw new AppError("discountValue must be > 0", 400)
    if (discountType === "percentage" && discountValue > 100) {
      throw new AppError("percentage discountValue must be <= 100", 400)
    }

    const minOrderValue =
      input.minOrderValue != null && String(input.minOrderValue).trim() !== ""
        ? toNumber(input.minOrderValue)
        : null
    if (minOrderValue != null && minOrderValue < 0) throw new AppError(400, "minOrderValue must be >= 0")

    const maxDiscountValue =
      input.maxDiscountValue != null && String(input.maxDiscountValue).trim() !== ""
        ? toPositiveNumber(input.maxDiscountValue)
        : null
    if (discountType === "percentage" && maxDiscountValue == null) {
      throw new AppError("maxDiscountValue is required for percentage vouchers", 400)
    }

    const quantity = toNonNegativeInt(input.quantity)
    if (quantity == null) throw new AppError("quantity must be >= 0", 400)

    const startDate = new Date(input.startDate)
    const endDate = new Date(input.endDate)
    if (Number.isNaN(startDate.getTime())) throw new AppError("startDate is required", 400)
    if (Number.isNaN(endDate.getTime())) throw new AppError("endDate is required", 400)
    if (endDate.getTime() <= startDate.getTime()) throw new AppError("endDate must be after startDate", 400)

    const applicableUsers = input.applicableUsers ?? "all"
    if (!["all", "new_user", "specific"].includes(applicableUsers)) {
      throw new AppError("applicableUsers must be all, new_user, or specific", 400)
    }

    const specificUsers = Array.isArray(input.specificUsers)
      ? input.specificUsers.map((x) => String(x)).filter(Boolean)
      : []
    if (applicableUsers === "specific" && specificUsers.length === 0) {
      throw new AppError("specificUsers is required when applicableUsers=specific", 400)
    }

    const row = await PromoVouchers.create({
      code,
      discountType,
      discountValue,
      minOrderValue,
      maxDiscountValue,
      quantity,
      usedCount: 0,
      startDate,
      endDate,
      isActive: Boolean(input.isActive ?? true),
      createdBy: "admin",
      applicableUsers,
      specificUsers: specificUsers.length ? specificUsers : null,
      createdByUserId: createdByUserId != null ? Number(createdByUserId) : null,
    })

    return serialize(row)
  },

  update: async (id, patch) => {
    const row = await PromoVouchers.findByPk(Number(id))
    if (!row) throw new AppError("Voucher not found", 404)

    const next = {}

    if (patch.code != null) {
      const code = normalizeCode(patch.code)
      if (!code) throw new AppError("code cannot be empty", 400)
      const dup = await PromoVouchers.findOne({ where: { code, id: { [Op.ne]: row.id } } })
      if (dup) throw new AppError("code must be unique", 409)
      next.code = code
    }

    if (patch.discountType != null) {
      if (patch.discountType !== "percentage" && patch.discountType !== "fixed") {
        throw new AppError("discountType must be percentage or fixed", 400)
      }
      next.discountType = patch.discountType
    }

    if (patch.discountValue != null) {
      const discountValue = toPositiveNumber(patch.discountValue)
      if (discountValue == null) throw new AppError("discountValue must be > 0", 400)
      const dt = next.discountType ?? row.discountType
      if (dt === "percentage" && discountValue > 100) throw new AppError("percentage discountValue must be <= 100", 400)
      next.discountValue = discountValue
    }

    if (patch.minOrderValue !== undefined) {
      const v =
        patch.minOrderValue == null || String(patch.minOrderValue).trim() === ""
          ? null
          : toNumber(patch.minOrderValue)
      if (v != null && v < 0) throw new AppError(400, "minOrderValue must be >= 0")
      next.minOrderValue = v
    }

    if (patch.maxDiscountValue !== undefined) {
      const v =
        patch.maxDiscountValue == null || String(patch.maxDiscountValue).trim() === ""
          ? null
          : toPositiveNumber(patch.maxDiscountValue)
      next.maxDiscountValue = v
    }

    if (patch.quantity != null) {
      const quantity = toNonNegativeInt(patch.quantity)
      if (quantity == null) throw new AppError("quantity must be >= 0", 400)
      next.quantity = quantity
    }

    if (patch.startDate != null) {
      const d = new Date(patch.startDate)
      if (Number.isNaN(d.getTime())) throw new AppError("Invalid startDate", 400)
      next.startDate = d
    }
    if (patch.endDate != null) {
      const d = new Date(patch.endDate)
      if (Number.isNaN(d.getTime())) throw new AppError("Invalid endDate", 400)
      next.endDate = d
    }

    const start = next.startDate ?? row.startDate
    const end = next.endDate ?? row.endDate
    if (start && end && new Date(end).getTime() <= new Date(start).getTime()) {
      throw new AppError("endDate must be after startDate", 400)
    }

    const dt = next.discountType ?? row.discountType
    const maxDV = next.maxDiscountValue ?? row.maxDiscountValue
    if (dt === "percentage" && (maxDV == null || Number(maxDV) <= 0)) {
      throw new AppError("maxDiscountValue is required for percentage vouchers", 400)
    }

    if (patch.applicableUsers != null) {
      if (!["all", "new_user", "specific"].includes(patch.applicableUsers)) {
        throw new AppError("applicableUsers must be all, new_user, or specific", 400)
      }
      next.applicableUsers = patch.applicableUsers
    }

    if (patch.specificUsers !== undefined) {
      const specificUsers = Array.isArray(patch.specificUsers)
        ? patch.specificUsers.map((x) => String(x)).filter(Boolean)
        : []
      const au = next.applicableUsers ?? row.applicableUsers
      if (au === "specific" && specificUsers.length === 0) {
        throw new AppError("specificUsers is required when applicableUsers=specific", 400)
      }
      next.specificUsers = specificUsers.length ? specificUsers : null
    }

    if (patch.isActive != null) next.isActive = Boolean(patch.isActive)

    await row.update(next)
    return serialize(row)
  },

  softDelete: async (id) => {
    const row = await PromoVouchers.findByPk(Number(id))
    if (!row) throw new AppError("Voucher not found", 404)
    await row.update({ isActive: false })
    return serialize(row)
  },
}

