import models from "../models/index.js";
import { sendSuccess, sendError } from "../utils/response.js";

const { Orders, Order_Items, Products, sequelize } = models;

const canAccessOrder = (reqUser, order) => {
  const role = reqUser?.role;
  if (!role) return false;
  if (role === "admin" || role === "staff") return true;
  if (role === "customer") return String(order?.userId) === String(reqUser?.id);
  return false;
};

const parsePositiveInt = (value) => {
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return null;
  return n;
};

const createOrderItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const orderId = parsePositiveInt(req.params.orderId);
    if (!orderId) {
      await t.rollback();
      return sendError(res, 400, "Invalid orderId", null);
    }

    const productId = parsePositiveInt(req.body?.productId ?? req.body?.product_ID);
    const quantity = parsePositiveInt(req.body?.quantity ?? req.body?.qty);
    if (!productId || !quantity) {
      await t.rollback();
      return sendError(res, 400, "productId and quantity are required", null);
    }

    const order = await Orders.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return sendError(res, 404, "Order not found", null);
    }

    if (!canAccessOrder(req.user, order)) {
      await t.rollback();
      return sendError(res, 403, "Forbidden", null);
    }

    const product = await Products.findByPk(productId, { transaction: t });
    if (!product) {
      await t.rollback();
      return sendError(res, 404, "Product not found", null);
    }

    const price = Number(product.price);
    if (!Number.isFinite(price)) {
      await t.rollback();
      return sendError(res, 400, "Invalid product price", null);
    }

    const created = await Order_Items.create(
      {
        orderId,
        productId,
        quantity,
        price,
      },
      { transaction: t },
    );

    if (Orders.rawAttributes?.total_Amount) {
      const currentTotal = Number(order.total_Amount ?? 0);
      const nextTotal =
        (Number.isFinite(currentTotal) ? currentTotal : 0) + quantity * price;
      await order.update({ total_Amount: nextTotal }, { transaction: t });
    }

    await t.commit();
    return sendSuccess(res, 201, { created }, "Order item created");
  } catch (error) {
    try {
      await t.rollback();
    } catch {}
    return sendError(
      res,
      500,
      error?.message || "Failed to create order item",
      null,
    );
  }
};

const getOrderItems = async (req, res) => {
  try {
    const orderId = parsePositiveInt(req.params.orderId);
    if (!orderId) return sendError(res, 400, "Invalid orderId", null);

    const order = await Orders.findByPk(orderId);
    if (!order) return sendError(res, 404, "Order not found", null);

    if (!canAccessOrder(req.user, order)) {
      return sendError(res, 403, "Forbidden", null);
    }

    const include = [];
    const includeQuery = String(req.query?.include || "").toLowerCase();
    if (includeQuery.split(",").map((s) => s.trim()).includes("product")) {
      include.push({
        model: Products,
        as: "products",
        attributes: ["productId", "name", "image", "price"],
      });
    }

    const items = await Order_Items.findAll({
      where: { orderId },
      include,
      order: [["createdAt", "ASC"]],
    });

    return sendSuccess(res, 200, items, "OK");
  } catch (error) {
    return sendError(res, 500, error?.message || "Server error", null);
  }
};

const deleteOrderItem = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const orderId = parsePositiveInt(req.params.orderId);
    const orderItemId = parsePositiveInt(req.params.orderItemId);
    if (!orderId || !orderItemId) {
      await t.rollback();
      return sendError(res, 400, "Invalid orderId or orderItemId", null);
    }

    const order = await Orders.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return sendError(res, 404, "Order not found", null);
    }

    if (!canAccessOrder(req.user, order)) {
      await t.rollback();
      return sendError(res, 403, "Forbidden", null);
    }

    const item = await Order_Items.findByPk(orderItemId, { transaction: t });
    if (!item || String(item.orderId) !== String(orderId)) {
      await t.rollback();
      return sendError(res, 404, "Order item not found", null);
    }

    const quantity = Number(item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    await item.destroy({ transaction: t });

    if (Orders.rawAttributes?.total_Amount) {
      const currentTotal = Number(order.total_Amount ?? 0);
      const nextTotal =
        (Number.isFinite(currentTotal) ? currentTotal : 0) -
        (Number.isFinite(quantity * price) ? quantity * price : 0);
      await order.update(
        { total_Amount: Math.max(0, nextTotal) },
        { transaction: t },
      );
    }

    await t.commit();
    return sendSuccess(res, 200, null, "Order item deleted");
  } catch (error) {
    try {
      await t.rollback();
    } catch {}
    return sendError(
      res,
      500,
      error?.message || "Failed to delete order item",
      null,
    );
  }
};

const createOrderItemFlat = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const orderId = parsePositiveInt(req.body?.orderId ?? req.body?.order_ID);
    if (!orderId) {
      await t.rollback();
      return sendError(res, 400, "Invalid orderId", null);
    }

    const productId = parsePositiveInt(req.body?.productId ?? req.body?.product_ID);
    const quantity = parsePositiveInt(req.body?.quantity ?? req.body?.qty);
    if (!productId || !quantity) {
      await t.rollback();
      return sendError(res, 400, "productId and quantity are required", null);
    }

    const order = await Orders.findByPk(orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return sendError(res, 404, "Order not found", null);
    }

    if (!canAccessOrder(req.user, order)) {
      await t.rollback();
      return sendError(res, 403, "Forbidden", null);
    }

    const product = await Products.findByPk(productId, { transaction: t });
    if (!product) {
      await t.rollback();
      return sendError(res, 404, "Product not found", null);
    }

    const price = Number(product.price);
    if (!Number.isFinite(price)) {
      await t.rollback();
      return sendError(res, 400, "Invalid product price", null);
    }

    const created = await Order_Items.create(
      { orderId, productId, quantity, price },
      { transaction: t },
    );

    if (Orders.rawAttributes?.total_Amount) {
      const currentTotal = Number(order.total_Amount ?? 0);
      const nextTotal =
        (Number.isFinite(currentTotal) ? currentTotal : 0) + quantity * price;
      await order.update({ total_Amount: nextTotal }, { transaction: t });
    }

    await t.commit();
    return sendSuccess(res, 201, { created }, "Order item created");
  } catch (error) {
    try {
      await t.rollback();
    } catch {}
    return sendError(
      res,
      500,
      error?.message || "Failed to create order item",
      null,
    );
  }
};

const deleteOrderItemFlat = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const orderItemId = parsePositiveInt(req.params.orderItemId);
    if (!orderItemId) {
      await t.rollback();
      return sendError(res, 400, "Invalid orderItemId", null);
    }

    const item = await Order_Items.findByPk(orderItemId, { transaction: t });
    if (!item) {
      await t.rollback();
      return sendError(res, 404, "Order item not found", null);
    }

    const order = await Orders.findByPk(item.orderId, { transaction: t });
    if (!order) {
      await t.rollback();
      return sendError(res, 404, "Order not found", null);
    }

    if (!canAccessOrder(req.user, order)) {
      await t.rollback();
      return sendError(res, 403, "Forbidden", null);
    }

    const quantity = Number(item.quantity ?? 0);
    const price = Number(item.price ?? 0);
    await item.destroy({ transaction: t });

    if (Orders.rawAttributes?.total_Amount) {
      const currentTotal = Number(order.total_Amount ?? 0);
      const nextTotal =
        (Number.isFinite(currentTotal) ? currentTotal : 0) -
        (Number.isFinite(quantity * price) ? quantity * price : 0);
      await order.update(
        { total_Amount: Math.max(0, nextTotal) },
        { transaction: t },
      );
    }

    await t.commit();
    return sendSuccess(res, 200, null, "Order item deleted");
  } catch (error) {
    try {
      await t.rollback();
    } catch {}
    return sendError(
      res,
      500,
      error?.message || "Failed to delete order item",
      null,
    );
  }
};

export default {
  createOrderItem,
  getOrderItems,
  deleteOrderItem,
  createOrderItemFlat,
  deleteOrderItemFlat,
};
