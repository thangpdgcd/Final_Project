
import ordersService from "../service/ordersService.js";
import models from "../models/index.js";

const { Orders } = models;

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
};
