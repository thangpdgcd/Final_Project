
import ordersService from "../service/ordersService.js";
import models from "../models/index.js";

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

let getAllOrders = async (req, res) => {
  try {
    let orders = await ordersService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

let getOrderById = async (req, res) => {
  try {
    let orders = await ordersService.getOrderById(req.params.id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

let createOrders = async (req, res) => {
  try {
    const userId = req.user.id; // Lấy từ token (đã verify bởi authMiddleware)
    const { status, paymentMethod, paypalCaptureId } = req.body || {};
    const order = await ordersService.createOrders(userId, {
      status,
      paymentMethod,
      paypalCaptureId,
    });
    res.status(201).json({ message: "Order created  successfully", order });
  } catch (error) {
    const msg = error?.message || "Failed to create order";
    if (
      msg === "Missing userId" ||
      msg === "Cart not found" ||
      msg === "Cart is empty"
    ) {
      return res.status(400).json({ message: msg });
    }
    res.status(500).json({ message: msg });
  }
};

let updateOrders = async (req, res) => {
  try {
    const updatedOrders = await ordersService.updateOrder(
      req.params.id,
      req.body,
    );
    res.status(200).json(updatedOrders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let deleteOrders = async (req, res) => {
  try {
    const result = await ordersService.deleteOrders(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let approveOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const approverId = req.user.id;

    const order = await Orders.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = order.status ?? order.Status;
    const normalized =
      typeof currentStatus === "string" ? currentStatus.toLowerCase() : "";

    if (normalized !== "pending") {
      return res
        .status(409)
        .json({ message: `Order is not pending (current: ${currentStatus})` });
    }

    const updateData = {
      status: "confirmed",
    };

    // Persist approver id if your Orders model has a matching column.
    // (Your current model doesn't include this column, so this is safe/example-only.)
    const candidateFields = [
      "approvedBy",
      "approvedByUserId",
      "approvedByStaffId",
      "approvedByAdminId",
    ];

    for (const field of candidateFields) {
      if (Orders.rawAttributes && Orders.rawAttributes[field]) {
        updateData[field] = approverId;
        break;
      }
    }

    await order.update(updateData);

    return res.status(200).json({
      message: "Order confirmed",
      order,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: error?.message || "Failed to approve order" });
  }
};

export default {
  getAllOrders,
  getOrderById,
  createOrders,
  updateOrders,
  deleteOrders,
  approveOrder,
  getOrderItems: async (req, res) => {
    try {
      const orderId = parsePositiveInt(req.params.orderId);
      if (!orderId) return res.status(400).json({ message: "Invalid orderId" });

      const order = await Orders.findByPk(orderId);
      if (!order) return res.status(404).json({ message: "Order not found" });

      if (!canAccessOrder(req.user, order)) {
        return res.status(403).json({ message: "Forbidden" });
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

      return res.status(200).json(items);
    } catch (error) {
      return res.status(500).json({ message: error?.message || "Server error" });
    }
  },
  createOrderItem: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const orderId = parsePositiveInt(req.params.orderId);
      if (!orderId) return res.status(400).json({ message: "Invalid orderId" });

      const productId = parsePositiveInt(req.body?.productId ?? req.body?.product_ID);
      const quantity = parsePositiveInt(req.body?.quantity ?? req.body?.qty);
      if (!productId || !quantity) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "productId and quantity are required" });
      }

      const order = await Orders.findByPk(orderId, { transaction: t });
      if (!order) {
        await t.rollback();
        return res.status(404).json({ message: "Order not found" });
      }

      if (!canAccessOrder(req.user, order)) {
        await t.rollback();
        return res.status(403).json({ message: "Forbidden" });
      }

      const product = await Products.findByPk(productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: "Product not found" });
      }

      const price = Number(product.price);
      if (!Number.isFinite(price)) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid product price" });
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

      // Update order total if the column exists.
      if (Orders.rawAttributes?.total_Amount) {
        const currentTotal = Number(order.total_Amount ?? 0);
        const nextTotal = (Number.isFinite(currentTotal) ? currentTotal : 0) +
          quantity * price;
        await order.update({ total_Amount: nextTotal }, { transaction: t });
      }

      await t.commit();
      return res.status(201).json({ message: "Order item created", created });
    } catch (error) {
      try {
        await t.rollback();
      } catch {}
      return res
        .status(500)
        .json({ message: error?.message || "Failed to create order item" });
    }
  },
  deleteOrderItem: async (req, res) => {
    const t = await sequelize.transaction();
    try {
      const orderId = parsePositiveInt(req.params.orderId);
      const orderItemId = parsePositiveInt(req.params.orderItemId);
      if (!orderId || !orderItemId) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Invalid orderId or orderItemId" });
      }

      const order = await Orders.findByPk(orderId, { transaction: t });
      if (!order) {
        await t.rollback();
        return res.status(404).json({ message: "Order not found" });
      }

      if (!canAccessOrder(req.user, order)) {
        await t.rollback();
        return res.status(403).json({ message: "Forbidden" });
      }

      const item = await Order_Items.findByPk(orderItemId, { transaction: t });
      if (!item || String(item.orderId) !== String(orderId)) {
        await t.rollback();
        return res.status(404).json({ message: "Order item not found" });
      }

      const quantity = Number(item.quantity ?? 0);
      const price = Number(item.price ?? 0);
      await item.destroy({ transaction: t });

      if (Orders.rawAttributes?.total_Amount) {
        const currentTotal = Number(order.total_Amount ?? 0);
        const nextTotal = (Number.isFinite(currentTotal) ? currentTotal : 0) -
          (Number.isFinite(quantity * price) ? quantity * price : 0);
        await order.update(
          { total_Amount: Math.max(0, nextTotal) },
          { transaction: t },
        );
      }

      await t.commit();
      return res.status(200).json({ message: "Order item deleted" });
    } catch (error) {
      try {
        await t.rollback();
      } catch {}
      return res
        .status(500)
        .json({ message: error?.message || "Failed to delete order item" });
    }
  },
  createOrderItemFlat: async (req, res) => {
    // Backward-compat for FE calling /api/orderitems or /api/create-orderitems
    // Expected body: { orderId, productId, quantity } (accepts *_ID and qty)
    const t = await sequelize.transaction();
    try {
      const orderId = parsePositiveInt(req.body?.orderId ?? req.body?.order_ID);
      if (!orderId) return res.status(400).json({ message: "Invalid orderId" });

      const productId = parsePositiveInt(req.body?.productId ?? req.body?.product_ID);
      const quantity = parsePositiveInt(req.body?.quantity ?? req.body?.qty);
      if (!productId || !quantity) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "productId and quantity are required" });
      }

      const order = await Orders.findByPk(orderId, { transaction: t });
      if (!order) {
        await t.rollback();
        return res.status(404).json({ message: "Order not found" });
      }

      if (!canAccessOrder(req.user, order)) {
        await t.rollback();
        return res.status(403).json({ message: "Forbidden" });
      }

      const product = await Products.findByPk(productId, { transaction: t });
      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: "Product not found" });
      }

      const price = Number(product.price);
      if (!Number.isFinite(price)) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid product price" });
      }

      const created = await Order_Items.create(
        { orderId, productId, quantity, price },
        { transaction: t },
      );

      if (Orders.rawAttributes?.total_Amount) {
        const currentTotal = Number(order.total_Amount ?? 0);
        const nextTotal = (Number.isFinite(currentTotal) ? currentTotal : 0) +
          quantity * price;
        await order.update({ total_Amount: nextTotal }, { transaction: t });
      }

      await t.commit();
      return res.status(201).json({ message: "Order item created", created });
    } catch (error) {
      try {
        await t.rollback();
      } catch {}
      return res
        .status(500)
        .json({ message: error?.message || "Failed to create order item" });
    }
  },
  deleteOrderItemFlat: async (req, res) => {
    // Backward-compat for /api/orderitems/:orderItemId
    const t = await sequelize.transaction();
    try {
      const orderItemId = parsePositiveInt(req.params.orderItemId);
      if (!orderItemId) {
        await t.rollback();
        return res.status(400).json({ message: "Invalid orderItemId" });
      }

      const item = await Order_Items.findByPk(orderItemId, { transaction: t });
      if (!item) {
        await t.rollback();
        return res.status(404).json({ message: "Order item not found" });
      }

      const order = await Orders.findByPk(item.orderId, { transaction: t });
      if (!order) {
        await t.rollback();
        return res.status(404).json({ message: "Order not found" });
      }

      if (!canAccessOrder(req.user, order)) {
        await t.rollback();
        return res.status(403).json({ message: "Forbidden" });
      }

      const quantity = Number(item.quantity ?? 0);
      const price = Number(item.price ?? 0);
      await item.destroy({ transaction: t });

      if (Orders.rawAttributes?.total_Amount) {
        const currentTotal = Number(order.total_Amount ?? 0);
        const nextTotal = (Number.isFinite(currentTotal) ? currentTotal : 0) -
          (Number.isFinite(quantity * price) ? quantity * price : 0);
        await order.update(
          { total_Amount: Math.max(0, nextTotal) },
          { transaction: t },
        );
      }

      await t.commit();
      return res.status(200).json({ message: "Order item deleted" });
    } catch (error) {
      try {
        await t.rollback();
      } catch {}
      return res
        .status(500)
        .json({ message: error?.message || "Failed to delete order item" });
    }
  },
};
