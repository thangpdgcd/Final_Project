import models from "../models/index.js";
import { AppError } from "../utils/AppError.js";

const { Vouchers, Users, sequelize } = models;
const { Op } = models.Sequelize;

const envNumber = (name, fallback) => {
  const raw = process.env[name];
  if (raw == null || raw === "") return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
};

const toPositiveInt = (raw, fallback = 1) => {
  const n = Math.trunc(Number(raw));
  if (!Number.isFinite(n) || n < 1) return fallback;
  return n;
};

const toPositiveNumber = (raw) => {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/**
 * Public display status (synced with frontend).
 * - inactive: soft-deleted or record_status inactive
 * - pending: awaiting approval
 * - expired: past expiry OR usage exhausted
 * - active: usable
 */
export const computeDisplayStatus = (raw) => {
  const j = raw?.toJSON ? raw.toJSON() : raw;
  if (!j) return "inactive";
  if (j.status === "inactive" || j.deletedAt) return "inactive";
  if (j.status === "pending") return "pending";
  const now = Date.now();
  const exp = j.expiresAt ? new Date(j.expiresAt).getTime() : 0;
  const maxU = toPositiveInt(j.maxUsage, 1);
  const used = Number(j.usedCount ?? 0) || 0;
  if (exp && exp < now) return "expired";
  if (used >= maxU) return "expired";
  if (j.usedAt && maxU <= 1) return "expired";
  return "active";
};

const isVoucherExpired = (raw) => computeDisplayStatus(raw) === "expired";

const serializeUser = (u) => {
  if (!u) return null;
  const j = u.toJSON ? u.toJSON() : u;
  const id = j.userId ?? j.user_ID ?? j.id;
  return {
    userId: Number(id),
    name: j.name ?? "",
    email: j.email ?? "",
  };
};

export const serializeVoucher = (row) => {
  const j = row?.toJSON ? row.toJSON() : row;
  return {
    id: j.id,
    code: j.code,
    discount_type: j.type,
    discount_value: Number(j.value),
    max_discount_value: Number(j.maxDiscountValue),
    max_usage: toPositiveInt(j.maxUsage, 1),
    used_count: Number(j.usedCount ?? 0) || 0,
    expired_at: j.expiresAt,
    record_status: j.status,
    deleted_at: j.deletedAt,
    display_status: computeDisplayStatus(j),
    created_at: j.createdAt,
    updated_at: j.updatedAt,
    user_id: j.userId,
    assignee: serializeUser(j.user),
    created_by: serializeUser(j.createdByStaff),
  };
};

const includeAssociations = [
  {
    model: Users,
    as: "createdByStaff",
    attributes: ["userId", "name", "email"],
    required: false,
  },
  {
    model: Users,
    as: "user",
    attributes: ["userId", "name", "email"],
    required: false,
  },
];

const buildListWhere = (query) => {
  const where = {};
  const and = [];

  const includeInactive =
    String(query.includeInactive ?? "").toLowerCase() === "true" ||
    String(query.includeInactive ?? "") === "1";

  const statusFilter = String(query.status || "all").toLowerCase();
  const now = new Date();

  if (statusFilter === "inactive") {
    and.push({
      [Op.or]: [{ status: "inactive" }, { deletedAt: { [Op.ne]: null } }],
    });
  } else if (!includeInactive) {
    where.deletedAt = null;
  }

  const search = query.search ?? query.q;
  if (search) {
    where.code = { [Op.like]: `%${String(search).trim()}%` };
  }

  const userId = query.userId;
  if (userId !== undefined && userId !== null && String(userId).trim() !== "") {
    where.userId = Number(userId);
  }

  const dateFrom = query.dateFrom;
  const dateTo = query.dateTo;
  if (dateFrom || dateTo) {
    where.expiresAt = {};
    if (dateFrom) where.expiresAt[Op.gte] = new Date(dateFrom);
    if (dateTo) where.expiresAt[Op.lte] = new Date(dateTo);
  }

  if (statusFilter === "pending") {
    where.status = "pending";
  } else if (statusFilter === "active") {
    where.status = "active";
    and.push({ expiresAt: { [Op.gt]: now } });
    and.push(sequelize.literal("(vouchers.used_count < vouchers.max_usage)"));
  } else if (statusFilter === "expired") {
    and.push(
      sequelize.literal("(vouchers.expires_at < NOW() OR vouchers.used_count >= vouchers.max_usage)"),
    );
    where.status = { [Op.notIn]: ["inactive", "pending"] };
  }

  if (and.length) {
    where[Op.and] = and;
  }

  return { where, includeInactive };
};

export const createVoucherAdminService = () => {
  const listVouchers = async (query = {}) => {
    const page = Math.max(1, Number(query.page) || 1);
    const pageSize = Math.min(100, Math.max(1, Number(query.pageSize) || 20));
    const offset = (page - 1) * pageSize;

    const { where } = buildListWhere(query);

    const lite =
      String(query.lite ?? "").toLowerCase() === "true" ||
      String(query.lite ?? "") === "1";

    const { rows, count } = await Vouchers.findAndCountAll({
      where,
      include: lite ? [] : includeAssociations,
      order: [["createdAt", "DESC"]],
      limit: pageSize,
      offset,
      distinct: !lite,
    });

    return {
      items: rows.map(serializeVoucher),
      total: count,
      page,
      pageSize,
    };
  };

  const createVoucher = async ({
    code,
    discount_type,
    discount_value,
    max_usage,
    expired_at,
    user_id,
    record_status,
    staffId,
  }) => {
    const normalizedCode = String(code ?? "")
      .trim()
      .toUpperCase();
    if (!normalizedCode) throw new AppError("code is required", 400);

    const dup = await Vouchers.findOne({ where: { code: normalizedCode } });
    if (dup) throw new AppError("Voucher code already exists", 409);

    const normalizedType =
      discount_type === "fixed" || discount_type === "percent" ? discount_type : null;
    if (!normalizedType) throw new AppError("discount_type must be fixed or percent", 400);

    const numericValue = toPositiveNumber(discount_value);
    if (numericValue == null) throw new AppError("discount_value must be a positive number", 400);
    if (normalizedType === "percent" && numericValue > 100) {
      throw new AppError("percent discount_value must be <= 100", 400);
    }

    const maxUsage = toPositiveInt(max_usage, 1);

    const expiresAt = expired_at ? new Date(expired_at) : null;
    if (!expiresAt || Number.isNaN(expiresAt.getTime())) {
      throw new AppError("expired_at is required", 400);
    }
    if (expiresAt.getTime() <= Date.now()) {
      throw new AppError("expiry must be in the future", 400);
    }

    const envMax = envNumber("VOUCHER_MAX_DISCOUNT", 50000);
    if (normalizedType === "fixed" && numericValue > envMax) {
      throw new AppError(`fixed discount_value exceeds max (${envMax})`, 400);
    }

    const maxDiscountValue =
      normalizedType === "fixed" ? Math.min(numericValue, envMax) : envMax;

    let userId = null;
    if (user_id !== undefined && user_id !== null && String(user_id).trim() !== "") {
      userId = Number(user_id);
      if (!Number.isInteger(userId) || userId <= 0) throw new AppError("user_id must be a positive integer", 400);
      const u = await Users.findByPk(userId);
      if (!u) throw new AppError("Assignee user not found", 404);
    }

    const sid = Number(staffId);
    if (!Number.isInteger(sid) || sid <= 0) {
      throw new AppError("Invalid staff context", 401);
    }

    const creator = await Users.findByPk(sid);
    if (!creator) throw new AppError("Creator not found", 404);

    const initialStatus =
      record_status === "pending" || record_status === "active" ? record_status : "active";

    const row = await Vouchers.create({
      code: normalizedCode,
      userId,
      type: normalizedType,
      value: numericValue,
      maxDiscountValue,
      maxUsage,
      usedCount: 0,
      status: initialStatus,
      expiresAt,
      deletedAt: null,
      createdByStaffId: sid,
      usedAt: null,
      usedOrderId: null,
    });

    const full = await Vouchers.findByPk(row.id, { include: includeAssociations });
    return serializeVoucher(full);
  };

  const updateVoucher = async ({ id, patch, staffId }) => {
    const voucher = await Vouchers.findByPk(Number(id), { include: includeAssociations });
    if (!voucher) throw new AppError("Voucher not found", 404);
    if (voucher.deletedAt || voucher.status === "inactive") {
      throw new AppError("Cannot update an inactive voucher", 400);
    }
    if (isVoucherExpired(voucher)) {
      throw new AppError("Cannot update an expired voucher", 400);
    }

    const p = patch ?? {};

    if (p.code !== undefined) {
      const next = String(p.code).trim().toUpperCase();
      if (!next) throw new AppError("code cannot be empty", 400);
      if (next !== voucher.code) {
        const taken = await Vouchers.findOne({ where: { code: next } });
        if (taken && taken.id !== voucher.id) throw new AppError("Voucher code already exists", 409);
        voucher.code = next;
      }
    }

    if (p.discount_type !== undefined) {
      const t = p.discount_type === "fixed" || p.discount_type === "percent" ? p.discount_type : null;
      if (!t) throw new AppError("discount_type must be fixed or percent", 400);
      voucher.type = t;
    }

    if (p.discount_value !== undefined) {
      const n = toPositiveNumber(p.discount_value);
      if (n == null) throw new AppError("discount_value must be a positive number", 400);
      if (voucher.type === "percent" && n > 100) {
        throw new AppError("percent discount_value must be <= 100", 400);
      }
      const envMax = envNumber("VOUCHER_MAX_DISCOUNT", 50000);
      if (voucher.type === "fixed" && n > envMax) {
        throw new AppError(`fixed discount_value exceeds max (${envMax})`, 400);
      }
      voucher.value = n;
      if (voucher.type === "fixed") {
        voucher.maxDiscountValue = Math.min(n, envMax);
      } else {
        voucher.maxDiscountValue = envMax;
      }
    }

    if (p.max_usage !== undefined) {
      voucher.maxUsage = toPositiveInt(p.max_usage, 1);
    }

    if (p.expired_at !== undefined) {
      const d = new Date(p.expired_at);
      if (Number.isNaN(d.getTime())) throw new AppError("expired_at is invalid", 400);
      if (d.getTime() <= Date.now()) throw new AppError("expiry must be in the future", 400);
      voucher.expiresAt = d;
    }

    if (p.record_status !== undefined) {
      const rs = p.record_status;
      if (rs !== "active" && rs !== "pending" && rs !== "inactive") {
        throw new AppError("record_status must be active, pending, or inactive", 400);
      }
      voucher.status = rs;
    }

    if (p.user_id !== undefined) {
      if (p.user_id === null || String(p.user_id).trim() === "") {
        voucher.userId = null;
      } else {
        const uid = Number(p.user_id);
        const u = await Users.findByPk(uid);
        if (!u) throw new AppError("Assignee user not found", 404);
        voucher.userId = uid;
      }
    }

    await voucher.save();

    const full = await Vouchers.findByPk(voucher.id, { include: includeAssociations });
    void staffId;
    return serializeVoucher(full);
  };

  const softDeleteVoucher = async ({ id }) => {
    const voucher = await Vouchers.findByPk(Number(id));
    if (!voucher) throw new AppError("Voucher not found", 404);
    voucher.status = "inactive";
    voucher.deletedAt = new Date();
    await voucher.save();
    return { id: voucher.id, ok: true };
  };

  return {
    listVouchers,
    createVoucher,
    updateVoucher,
    softDeleteVoucher,
    computeDisplayStatus,
    serializeVoucher,
  };
};
