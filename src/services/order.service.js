import db from "../models/index.js";
import { Op } from "sequelize";
import { emitOrderNew, emitOrderUpdate } from "../infrastructure/socket/socketServer.js";
import { createNotificationService } from "./notification.service.js";
import { emitNotificationsToUsers } from "../infrastructure/socket/notificationEmitter.js";
import { emitNotificationToUser } from "../infrastructure/socket/notificationEmitter.js";
import { AppError } from "../utils/AppError.js";
import {
  addWalletCoin,
  ensureWalletCoinColumn,
  ensureWalletTransactionsTable,
  recordWalletTransaction,
} from "../utils/walletCoin.js";

const {
  sequelize,
  Orders,
  Order_Items,
  Products,
  Users,
  Carts,
  Cart_Items,
  OrderMeta,
  OrderChatMessage,
} = db;

const notificationService = createNotificationService();

const STATUS = {
  pending: "pending",
  confirmed: "confirmed",
  processing: "processing",
  shipped: "shipped",
  completed: "completed",
  refundRequested: "refund_requested",
  refunded: "refunded",
  cancelled: "cancelled",
};

const USER_CANCEL_ALLOWED = new Set([
  STATUS.pending,
  STATUS.confirmed,
  STATUS.processing,
]);

const STATUS_TRANSITIONS = {
  [STATUS.pending]: [STATUS.confirmed, STATUS.cancelled],
  [STATUS.confirmed]: [STATUS.processing, STATUS.cancelled],
  [STATUS.processing]: [STATUS.shipped, STATUS.cancelled],
  [STATUS.shipped]: [STATUS.completed, STATUS.refundRequested],
  [STATUS.completed]: [STATUS.refundRequested],
  [STATUS.refundRequested]: [STATUS.refunded, STATUS.completed],
  [STATUS.refunded]: [],
  [STATUS.cancelled]: [],
};

let ensureTablesPromise = null;

const normalizeRole = (raw) => {
  const role = String(raw ?? "").trim().toLowerCase();
  if (!role) return null;
  // Accept both string roles and numeric ids from DB/JWT payloads.
  if (role === "user" || role === "customer" || role === "1") return "customer";
  if (role === "admin" || role === "2") return "admin";
  if (role === "staff" || role === "3") return "staff";
  return role;
};

const normalizeStatus = (raw, fallback = STATUS.pending) => {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (Object.values(STATUS).includes(key)) return key;
  const alias = {
    preparing: STATUS.processing,
    processing: STATUS.processing,
    shipping: STATUS.shipped,
    delivering: STATUS.shipped,
    sent: STATUS.completed,
    delivered: STATUS.completed,
    refundrequested: STATUS.refundRequested,
    refundrequest: STATUS.refundRequested,
  };
  if (alias[key]) return alias[key];
  if (key === "paid") return STATUS.confirmed;
  return fallback;
};

const toInt = (raw) => {
  const n = Number(raw);
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const ensureOrderTables = async () => {
  if (!OrderMeta || !OrderChatMessage) return;
  // Avoid doing `sync()` inside request handlers in production: it can be very slow
  // (especially on remote DB like TiDB Cloud) and will make the UI "load forever".
  // Migrations should create these tables. In development, allow opt-in sync.
  const allowSync =
    process.env.DB_SYNC_ON_REQUEST === "true" ||
    (process.env.NODE_ENV !== "production" && process.env.DB_SYNC_ON_REQUEST !== "false");

  if (!allowSync) return;

  if (!ensureTablesPromise) {
    ensureTablesPromise = Promise.all([OrderMeta.sync(), OrderChatMessage.sync()]);
  }
  await ensureTablesPromise;
};

const ORDER_INCLUDE = [
  {
    model: Users,
    as: "users",
    attributes: ["userId", "name", "email", "phoneNumber", "roleID"],
  },
  {
    model: Order_Items,
    as: "order_Items",
    include: [
      {
        model: Products,
        as: "products",
        attributes: ["productId", "name", "price", "image"],
      },
    ],
  },
];

const ORDER_INCLUDE_LITE = [
  {
    model: Users,
    as: "users",
    attributes: ["userId", "name", "email", "phoneNumber", "roleID"],
  },
];

const serializeOrderRow = (row) => {
  if (!row) return row;
  const data = typeof row.toJSON === "function" ? row.toJSON() : { ...row };

  // Normalize legacy shapes for frontend clients.
  // - Sequelize association uses alias `users`, but many clients expect `user`.
  if (!data.user && data.users && typeof data.users === "object") {
    data.user = data.users;
  }
  // - Orders model stores `total_Amount`, but some clients expect different keys.
  if (data.total_Amount != null) {
    const n = Number(data.total_Amount);
    if (Number.isFinite(n)) {
      data.totalAmount = n;
      data.total_amount = n;
      data.totalOrderPrice = n;
      data.totalPrice = n;
    }
  }
  if (data.orderId != null && data.id == null) {
    data.id = data.orderId;
    data.order_ID = data.orderId;
  }

  return data;
};

const attachOrderMeta = async (rows) => {
  // Ensure tables only when explicitly allowed; otherwise just skip if missing.
  await ensureOrderTables();
  const list = Array.isArray(rows) ? rows : [rows];
  const base = list.map(serializeOrderRow);
  const ids = list
    .map((row) => row?.orderId)
    .filter((id) => Number.isFinite(Number(id)))
    .map((id) => Number(id));
  if (ids.length === 0 || !OrderMeta) return base;

  let metas = [];
  try {
    metas = await OrderMeta.findAll({ where: { orderId: ids } });
  } catch {
    // If the meta table isn't present (or DB is restricted), keep the response usable.
    return base;
  }
  const map = new Map(metas.map((m) => [Number(m.orderId), m]));
  return base.map((data) => {
    if (!data) return data;
    const meta = map.get(Number(data.orderId ?? data.id));
    if (meta) {
      data.staffId = meta.staffId ?? null;
      data.note = meta.note ?? null;
      data.order_Meta = meta;
    }
    return data;
  });
};

const getOrderOr404 = async (orderId, options = {}) => {
  const id = toInt(orderId);
  if (!id || id <= 0) throw new AppError("Invalid orderId", 400);
  const order = await Orders.findByPk(id, { include: ORDER_INCLUDE, ...options });
  if (!order) throw new AppError("Order not found", 404);
  return order;
};

const getUserById = async (userId) => {
  const id = toInt(userId);
  if (!id || id <= 0) throw new AppError("Invalid userId", 400);
  const user = await Users.findByPk(id, { attributes: ["userId", "roleID", "name"] });
  if (!user) throw new AppError("User not found", 404);
  return user;
};

const isStaffOrAdminRoleId = (roleIdRaw) => {
  const roleId = String(roleIdRaw ?? "").trim();
  return roleId === "2" || roleId === "3";
};

const normalizePaymentMethod = (raw) => {
  const key = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  if (["paypal", "pay_pal"].includes(key)) return "paypal";
  if (["coffee_coin", "coin", "wallet", "coffeecoin"].includes(key)) {
    return "coffee_coin";
  }
  return "cod";
};

const assertCanAccessOrder = async ({ actor, order }) => {
  const role = normalizeRole(actor?.role);
  if (role === "admin" || role === "staff") return;
  if (role === "customer" && String(order.userId) === String(actor?.id)) return;
  throw new AppError("Forbidden", 403);
};

export const validateOrderStatusTransition = (currentRaw, nextRaw) => {
  const current = normalizeStatus(currentRaw, STATUS.pending);
  const next = normalizeStatus(nextRaw, current);
  if (current === next) return next;
  const allowed = STATUS_TRANSITIONS[current] ?? [];
  if (!allowed.includes(next)) {
    throw new AppError(
      `Invalid status transition: ${current} -> ${next}`,
      409,
    );
  }
  return next;
};

const getOrderByIdForActor = async ({ orderId, actor }) => {
  const order = await getOrderOr404(orderId);
  await assertCanAccessOrder({ actor, order });
  const [serialized] = await attachOrderMeta(order);
  return serialized;
};

const listAllOrders = async ({ lite = false } = {}) => {
  // Do not include customer-cancelled orders in staff queue.
  const rows = await Orders.findAll({
    where: { status: { [Op.ne]: STATUS.cancelled } },
    include: lite ? ORDER_INCLUDE_LITE : ORDER_INCLUDE,
    order: [["createdAt", "DESC"]],
  });
  return attachOrderMeta(rows);
};

const listUserOrders = async ({ userId, status, lite = false }) => {
  const id = toInt(userId);
  if (!id || id <= 0) throw new AppError("Invalid userId", 400);
  const where = { userId: id };
  if (status) where.status = normalizeStatus(status);
  const rows = await Orders.findAll({
    where,
    include: lite ? ORDER_INCLUDE_LITE : ORDER_INCLUDE,
    order: [["createdAt", "DESC"]],
  });
  return attachOrderMeta(rows);
};

const listStaffOrders = async ({ staffId, status, assigned, lite = false }) => {
  await ensureOrderTables();
  const where = {};
  if (status) {
    const normalized = normalizeStatus(status);
    if (normalized === STATUS.cancelled) return [];
    where.status = normalized;
  } else {
    where.status = { [Op.ne]: STATUS.cancelled };
  }
  const rows = await Orders.findAll({
    where,
    include: lite ? ORDER_INCLUDE_LITE : ORDER_INCLUDE,
    order: [["createdAt", "DESC"]],
  });
  const withMeta = await attachOrderMeta(rows);
  const me = toInt(staffId);
  const assignedMode = String(assigned ?? "").trim().toLowerCase();
  if (assignedMode === "assigned") return withMeta.filter((o) => Number(o.staffId) > 0);
  if (assignedMode === "unassigned") return withMeta.filter((o) => !Number(o.staffId));
  if (Number.isFinite(me) && me > 0) {
    return withMeta.filter((o) => !o.staffId || Number(o.staffId) === me);
  }
  return withMeta;
};

const createOrderFromCart = async ({
  userId,
  note,
  paymentMethod,
  paypalCaptureId,
  shippingAddress,
  shippingMethod,
  items,
}) => {
  const uid = toInt(userId);
  if (!uid || uid <= 0) throw new AppError("Missing userId", 400);
  await ensureOrderTables();
  await ensureWalletCoinColumn();
  await ensureWalletTransactionsTable();

  const normalizedPaymentMethod = normalizePaymentMethod(paymentMethod);

  const tx = await sequelize.transaction();
  try {
    const cart = await Carts.findOne({
      where: { userId: uid },
      include: [{ model: Cart_Items, as: "cart_Items" }],
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    // If cart is missing/empty, fall back to request items (compat for frontend selection sync issues).
    const fallbackItems = Array.isArray(items) ? items : [];
    if (!cart && fallbackItems.length === 0) throw new AppError("Cart not found", 400);
    const lineItems =
      cart && Array.isArray(cart.cart_Items) && cart.cart_Items.length > 0
        ? cart.cart_Items
        : fallbackItems;
    if (!Array.isArray(lineItems) || lineItems.length === 0) {
      throw new AppError("Cart is empty", 400);
    }

    const totalAmount = lineItems.reduce((sum, item) => {
      const price = Number(item.price ?? item?.products?.price ?? 0);
      const quantity = Number(item.quantity ?? 0);
      return sum + Math.max(0, price) * Math.max(0, quantity);
    }, 0);

    // Shipping fee rule (by total).
    // Configurable via env:
    // - SHIPPING_FREE_THRESHOLD_VND (default 200000)
    // - SHIPPING_FEE_VND (default 17000)
    const freeThreshold = Math.max(
      0,
      Math.trunc(Number(process.env.SHIPPING_FREE_THRESHOLD_VND ?? 200000)),
    );
    const baseShipFee = Math.max(0, Math.trunc(Number(process.env.SHIPPING_FEE_VND ?? 17000)));
    const expressShipFee = Math.max(
      0,
      Math.trunc(Number(process.env.SHIPPING_EXPRESS_FEE_VND ?? 50000)),
    );
    const method = String(shippingMethod ?? "standard").trim().toLowerCase();
    const shippingFee = method === "express" ? expressShipFee : totalAmount >= freeThreshold ? 0 : baseShipFee;
    const grandTotal = Math.max(0, Math.trunc(Number(totalAmount) + Number(shippingFee)));

    const created = await Orders.create(
      {
        userId: uid,
        total_Amount: grandTotal,
        status: STATUS.pending,
        shipping_Address: String(shippingAddress ?? "Not set"),
      },
      { transaction: tx },
    );

    for (const item of lineItems) {
      const pid = toInt(item.productId ?? item.product_ID ?? item.productID ?? item?.products?.productId);
      if (!pid) continue;
      await Order_Items.create(
        {
          orderId: created.orderId,
          productId: pid,
          quantity: Math.max(1, Math.trunc(Number(item.quantity ?? 1))),
          price: Math.max(0, Math.trunc(Number(item.price ?? item?.products?.price ?? 0))),
        },
        { transaction: tx },
      );
    }

    if (cart) {
      await Cart_Items.destroy({ where: { cartId: cart.cartId }, transaction: tx });
    }

    if (normalizedPaymentMethod === "coffee_coin") {
      const amountCoin = Math.max(0, Math.trunc(Number(grandTotal) || 0));
      if (amountCoin <= 0) {
        throw new AppError("Invalid order total for Coffee Coin payment", 400);
      }

      const [walletRows] = await sequelize.query(
        "SELECT wallet_coin AS walletCoin FROM Users WHERE user_ID = :uid LIMIT 1 FOR UPDATE",
        {
          replacements: { uid },
          transaction: tx,
        },
      );
      const currentWalletCoin = Math.max(
        0,
        Math.trunc(Number(walletRows?.[0]?.walletCoin ?? 0)),
      );
      if (currentWalletCoin < amountCoin) {
        throw new AppError("Insufficient Coffee Coin balance", 400);
      }
      const balanceAfter = currentWalletCoin - amountCoin;

      await sequelize.query(
        "UPDATE Users SET wallet_coin = :nextBalance WHERE user_ID = :uid",
        {
          replacements: { uid, nextBalance: balanceAfter },
          transaction: tx,
        },
      );


      await sequelize.query(
        `INSERT INTO wallet_transactions
          (user_id, type, amount_xu, balance_after, source, reference_id, note, createdAt, updatedAt)
         VALUES
          (:userId, :type, :amountXu, :balanceAfter, :source, :referenceId, :note, NOW(), NOW())`,
        {
          replacements: {
            userId: uid,
            type: "SPEND",
            amountXu: amountCoin,
            balanceAfter,
            source: "ORDER_PAYMENT",
            referenceId: String(created.orderId),
            note: "Paid order by Coffee Coin",
          },
          transaction: tx,
        },
      );
    }

    const paymentNote =
      normalizedPaymentMethod === "paypal"
        ? `Payment: PayPal${paypalCaptureId ? ` | capture: ${String(paypalCaptureId)}` : ""}`
        : normalizedPaymentMethod === "coffee_coin"
          ? "Payment: Coffee Coin"
          : "Payment: COD";

    const mergedNote = [note, paymentNote]
      .map((x) => String(x ?? "").trim())
      .filter(Boolean)
      .join(" | ");

    await OrderMeta.upsert(
      {
        orderId: created.orderId,
        note: mergedNote || null,
      },
      { transaction: tx },
    );

    // Reward wallet immediately after order is created: add back shippingFee.
    // This is done in the same transaction for consistency.
    if (shippingFee > 0) {
      const [walletRows2] = await sequelize.query(
        "SELECT wallet_coin AS walletCoin FROM Users WHERE user_ID = :uid LIMIT 1 FOR UPDATE",
        { replacements: { uid }, transaction: tx },
      );
      const current2 = Math.max(0, Math.trunc(Number(walletRows2?.[0]?.walletCoin ?? 0)));
      const next2 = current2 + Math.max(0, Math.trunc(Number(shippingFee) || 0));
      await sequelize.query("UPDATE Users SET wallet_coin = :nextBalance WHERE user_ID = :uid", {
        replacements: { uid, nextBalance: next2 },
        transaction: tx,
      });
      await sequelize.query(
        `INSERT INTO wallet_transactions
          (user_id, type, amount_xu, balance_after, source, reference_id, note, createdAt, updatedAt)
         VALUES
          (:userId, :type, :amountXu, :balanceAfter, :source, :referenceId, :note, NOW(), NOW())`,
        {
          replacements: {
            userId: uid,
            type: "EARN",
            amountXu: Math.max(0, Math.trunc(Number(shippingFee) || 0)),
            balanceAfter: next2,
            source: "ORDER_SHIPPING_BONUS",
            referenceId: String(created.orderId),
            note: "Shipping bonus on order creation",
          },
          transaction: tx,
        },
      );
    }

    await tx.commit();
    const order = await getOrderByIdForActor({
      orderId: created.orderId,
      actor: { id: uid, role: "customer" },
    });
    emitOrderNew(order);

    // Notify the customer who created the order.
    try {
      const row = await notificationService.create({
        userId: uid,
        type: "order",
        message: `Đơn hàng #${created.orderId} đã được tạo thành công`,
      });
      emitNotificationToUser({ userId: uid, notification: row });
    } catch {}

    // Notify staff/admin about new order (per-user notifications, no broadcast)
    try {
      const staffAdmins = await Users.findAll({
        where: { roleID: { [Op.in]: ["2", "3"] } },
        attributes: ["userId"],
        raw: true,
      });
      const ids = staffAdmins.map((u) => u.userId);
      const rows = await notificationService.createForUsers({
        userIds: ids,
        type: "order",
        message: `New order #${created.orderId} created`,
      });
      emitNotificationsToUsers({ userIds: ids, notifications: rows });
    } catch {}

    return order;
  } catch (error) {
    try {
      await tx.rollback();
    } catch {}
    if (error instanceof AppError) throw error;
    throw new AppError(error?.message || "Unable to create order", 400);
  }
};

const assignOrder = async ({ orderId, actor, staffId, note }) => {
  const role = normalizeRole(actor?.role);
  if (role !== "staff" && role !== "admin") {
    throw new AppError("Only staff/admin can assign order", 403);
  }

  await ensureOrderTables();
  const order = await getOrderOr404(orderId);

  const sid = toInt(staffId ?? actor?.id);
  if (!sid || sid <= 0) throw new AppError("Invalid staffId", 400);
  const staff = await getUserById(sid);
  if (!isStaffOrAdminRoleId(staff.roleID)) {
    throw new AppError("Assigned user must be staff/admin", 400);
  }

  await OrderMeta.upsert({
    orderId: order.orderId,
    staffId: sid,
    note: note != null ? String(note) : null,
  });

  const full = await getOrderByIdForActor({ orderId: order.orderId, actor });
  emitOrderUpdate(full);
  return full;
};

const updateOrderStatus = async ({ orderId, actor, status }) => {
  const role = normalizeRole(actor?.role);
  if (role !== "staff" && role !== "admin") {
    throw new AppError("Only staff/admin can update status", 403);
  }

  const order = await getOrderOr404(orderId);
  const next = validateOrderStatusTransition(order.status, status);

  await order.update({ status: next });
  const full = await getOrderByIdForActor({ orderId: order.orderId, actor });
  emitOrderUpdate(full);
  return full;
};

const cancelOrderByUser = async ({ orderId, actor, note }) => {
  const role = normalizeRole(actor?.role);
  if (role !== "customer") {
    throw new AppError("Only customer can cancel by this endpoint", 403);
  }

  await ensureOrderTables();
  const order = await getOrderOr404(orderId);
  await assertCanAccessOrder({ actor, order });
  const current = normalizeStatus(order.status);
  if (!USER_CANCEL_ALLOWED.has(current)) {
    throw new AppError("Order cannot be cancelled at this stage", 409);
  }

  await order.update({ status: STATUS.cancelled });
  if (note != null) {
    await OrderMeta.upsert({
      orderId: order.orderId,
      note: String(note),
    });
  }
  const full = await getOrderByIdForActor({ orderId: order.orderId, actor });
  emitOrderUpdate(full);
  return full;
};

const requestRefundByUser = async ({ orderId, actor, note }) => {
  const role = normalizeRole(actor?.role);
  if (role !== "customer") {
    throw new AppError("Only customer can request refund", 403);
  }

  await ensureOrderTables();
  const order = await getOrderOr404(orderId);
  await assertCanAccessOrder({ actor, order });

  const current = normalizeStatus(order.status);
  if (current !== STATUS.completed && current !== STATUS.shipped) {
    throw new AppError("Refund request is only allowed for delivered/completed orders", 409);
  }

  await order.update({ status: STATUS.refundRequested });
  await OrderMeta.upsert({
    orderId: order.orderId,
    note:
      note != null && String(note).trim()
        ? String(note).trim()
        : "Customer requested refund",
  });
  const full = await getOrderByIdForActor({ orderId: order.orderId, actor });
  emitOrderUpdate(full);

  // Notify customer + staff/admin about refund request.
  try {
    const row = await notificationService.create({
      userId: order.userId,
      type: "order",
      message: `Yêu cầu hoàn tiền cho đơn hàng #${order.orderId} đã được gửi`,
    });
    emitNotificationToUser({ userId: order.userId, notification: row });
  } catch {}

  try {
    const staffAdmins = await Users.findAll({
      where: { roleID: { [Op.in]: ["2", "3"] } },
      attributes: ["userId"],
      raw: true,
    });
    const ids = staffAdmins.map((u) => u.userId);
    const rows = await notificationService.createForUsers({
      userIds: ids,
      type: "order",
      message: `Refund requested for order #${order.orderId}`,
    });
    emitNotificationsToUsers({ userIds: ids, notifications: rows });
  } catch {}

  return full;
};

const resolveRefundDecision = async ({ orderId, actor, approved, note }) => {
  const role = normalizeRole(actor?.role);
  if (role !== "staff" && role !== "admin") {
    throw new AppError("Only staff/admin can resolve refund request", 403);
  }

  await ensureOrderTables();
  const order = await getOrderOr404(orderId);
  const current = normalizeStatus(order.status);
  if (current !== STATUS.refundRequested) {
    throw new AppError("Order is not in refund-requested state", 409);
  }

  const next = approved ? STATUS.refunded : STATUS.completed;
  await order.update({ status: next });
  if (approved) {
    const refundXu = Math.max(0, Math.trunc(Number(order.total_Amount ?? 0)));
    if (refundXu > 0) {
      const nextBalance = await addWalletCoin({ userId: order.userId, amountXu: refundXu });
      await recordWalletTransaction({
        userId: order.userId,
        type: "REFUND",
        amountXu: refundXu,
        balanceAfter: nextBalance ?? refundXu,
        source: "ORDER_REFUND",
        referenceId: String(order.orderId),
        note: "Refund approved by staff",
      });
    }
  }
  await OrderMeta.upsert({
    orderId: order.orderId,
    note:
      note != null && String(note).trim()
        ? String(note).trim()
        : approved
          ? "Refund approved by staff"
          : "Refund rejected by staff",
    staffId: toInt(actor?.id) || null,
  });

  const full = await getOrderByIdForActor({ orderId: order.orderId, actor });
  emitOrderUpdate(full);

  // Notify customer about the refund decision (and wallet credit if approved).
  try {
    const row = await notificationService.create({
      userId: order.userId,
      type: "order",
      message: approved
        ? `Đơn hàng #${order.orderId} đã được hoàn tiền`
        : `Yêu cầu hoàn tiền cho đơn hàng #${order.orderId} đã bị từ chối`,
    });
    emitNotificationToUser({ userId: order.userId, notification: row });
  } catch {}

  return full;
};

const deleteOrderByActor = async ({ orderId, actor }) => {
  const role = normalizeRole(actor?.role);
  if (role !== "staff" && role !== "admin") {
    throw new AppError("Only staff/admin can delete orders", 403);
  }

  const order = await getOrderOr404(orderId);

  await sequelize.transaction(async (tx) => {
    await Order_Items.destroy({ where: { orderId: order.orderId }, transaction: tx });
    if (OrderMeta) {
      await OrderMeta.destroy({ where: { orderId: order.orderId }, transaction: tx });
    }
    if (OrderChatMessage) {
      await OrderChatMessage.destroy({ where: { orderId: order.orderId }, transaction: tx });
    }
    await Orders.destroy({ where: { orderId: order.orderId }, transaction: tx });
  });

  return { deleted: true, orderId: order.orderId };
};

const updateOrderByActor = async ({ orderId, actor, body }) => {
  const payload = { ...(body || {}) };
  const role = normalizeRole(actor?.role);
  const order = await getOrderOr404(orderId);
  await assertCanAccessOrder({ actor, order });

  if (payload.status !== undefined) {
    if (role !== "staff" && role !== "admin") {
      throw new AppError("Only staff/admin can update status", 403);
    }
    payload.status = validateOrderStatusTransition(order.status, payload.status);
  } else {
    delete payload.status;
  }

  await order.update(payload);
  if (payload.note !== undefined) {
    await ensureOrderTables();
    await OrderMeta.upsert({ orderId: order.orderId, note: String(payload.note ?? "") });
  }

  const full = await getOrderByIdForActor({ orderId: order.orderId, actor });
  emitOrderUpdate(full);
  return full;
};

const listOrderMessages = async ({ orderId, actor }) => {
  await ensureOrderTables();
  const order = await getOrderOr404(orderId);
  await assertCanAccessOrder({ actor, order });

  const rows = await OrderChatMessage.findAll({
    where: { orderId: order.orderId },
    order: [["createdAt", "ASC"]],
  });
  return rows.map((r) => (typeof r.toJSON === "function" ? r.toJSON() : r));
};

const createOrderMessage = async ({ orderId, actor, message }) => {
  await ensureOrderTables();
  const text = String(message ?? "").trim();
  if (!text) throw new AppError("Message is required", 400);
  const order = await getOrderOr404(orderId);
  await assertCanAccessOrder({ actor, order });

  const row = await OrderChatMessage.create({
    orderId: order.orderId,
    senderId: actor.id,
    role: normalizeRole(actor.role),
    message: text,
  });
  return typeof row.toJSON === "function" ? row.toJSON() : row;
};

const getAnalytics = async ({ range = "week" }) => {
  // In a real app, this would use complex Sequelize/SQL grouping.
  // For this project, we'll fetch orders and process them to ensure cross-DB compatibility (MySQL/SQLite).
  const orders = await Orders.findAll({
    attributes: ["createdAt", "total_Amount", "status"],
    where: { status: { [Op.ne]: STATUS.cancelled } },
  });

  const users = await Users.findAll({
    attributes: ["createdAt"],
  });

  // Grouping logic based on range
  const aggregate = (data, rangeType) => {
    const map = {};
    data.forEach((item) => {
      const date = new Date(item.createdAt);
      let key = "";
      if (rangeType === "week") {
        key = date.toLocaleDateString("en-US", { weekday: "short" });
      } else if (rangeType === "month") {
        const weekNum = Math.ceil(date.getDate() / 7);
        key = `W${weekNum}`;
      } else if (rangeType === "year") {
        key = date.toLocaleDateString("en-US", { month: "short" });
      }
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  };

  const orderStats = aggregate(orders, range);
  const userStats = aggregate(users, range);

  // Combine results into a chart-ready format
  const keys =
    range === "week"
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : range === "month"
        ? ["W1", "W2", "W3", "W4"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  return keys.map((name) => ({
    name,
    messages: orderStats[name] || 0, // Mapping "orders" to "messages" label for frontend compatibility
    users: userStats[name] || 0,
  }));
};

export const orderService = {
  STATUS,
  listAllOrders,
  listUserOrders,
  listStaffOrders,
  getOrderByIdForActor,
  createOrderFromCart,
  assignOrder,
  updateOrderStatus,
  cancelOrderByUser,
  requestRefundByUser,
  resolveRefundDecision,
  deleteOrderByActor,
  updateOrderByActor,
  listOrderMessages,
  createOrderMessage,
  getAnalytics,
};

export default orderService;
