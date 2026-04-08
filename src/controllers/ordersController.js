import ordersService from "../services/ordersService.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await ordersService.getAllOrders();
  return sendSuccess(res, 200, orders, "OK");
});

const getOrderById = asyncHandler(async (req, res) => {
  const orders = await ordersService.getOrderById(req.params.id);
  return sendSuccess(res, 200, orders, "OK");
});

const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (userId == null || userId === "") {
    throw new AppError("Unauthorized", 401);
  }
  const orders = await ordersService.getOrdersByUserId(userId);
  return sendSuccess(res, 200, orders, "OK");
});

const createOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { status } = req.body || {};
  const order = await ordersService.createOrders(userId, { status });
  return sendSuccess(res, 201, { order }, "Order created successfully");
});

const updateOrders = asyncHandler(async (req, res) => {
  const body = req.body || {};
  const updatedOrders = await ordersService.updateOrderWithGuards(
    req.params.id,
    body,
    req.user.id,
  );
  return sendSuccess(res, 200, updatedOrders, "Order updated");
});

const deleteOrders = asyncHandler(async (req, res) => {
  const result = await ordersService.deleteOrders(req.params.id);
  return sendSuccess(res, 200, result, "OK");
});

const approveOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  const approverId = req.user.id;
  const full = await ordersService.approveOrder(orderId, approverId);
  return sendSuccess(res, 200, { order: full }, "Order confirmed");
});

export default {
  getAllOrders,
  getOrderById,
  getMyOrders,
  createOrders,
  updateOrders,
  deleteOrders,
  approveOrder,
};
