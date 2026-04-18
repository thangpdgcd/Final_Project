import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendSuccess } from "../../utils/response.js";
import { orderService } from "./order.service.js";

const actorFromReq = (req) => ({
  id: req.user?.id ?? req.user?.userId,
  role: req.user?.role,
});

const getAllOrders = asyncHandler(async (req, res) => {
  const data = await orderService.listAllOrders();
  return sendSuccess(res, 200, data, "OK");
});

const getOrderById = asyncHandler(async (req, res) => {
  const data = await orderService.getOrderByIdForActor({
    orderId: req.params.id,
    actor: actorFromReq(req),
  });
  return sendSuccess(res, 200, data, "OK");
});

const getMyOrders = asyncHandler(async (req, res) => {
  const data = await orderService.listUserOrders({
    userId: req.user?.id ?? req.user?.userId,
    status: req.query?.status,
  });
  return sendSuccess(res, 200, data, "OK");
});

const getUserOrders = asyncHandler(async (req, res) => {
  const data = await orderService.listUserOrders({
    userId: req.params.userId,
    status: req.query?.status,
  });
  return sendSuccess(res, 200, data, "OK");
});

const getStaffOrders = asyncHandler(async (req, res) => {
  const data = await orderService.listStaffOrders({
    staffId: req.user?.id ?? req.user?.userId,
    status: req.query?.status,
    assigned: req.query?.assigned,
  });
  return sendSuccess(res, 200, data, "OK");
});

const createOrder = asyncHandler(async (req, res) => {
  const data = await orderService.createOrderFromCart({
    userId: req.user?.id ?? req.user?.userId,
    note: req.body?.note,
    paymentMethod: req.body?.paymentMethod,
    paypalCaptureId: req.body?.paypalCaptureId,
  });
  return sendSuccess(res, 201, { order: data }, "Order created successfully");
});

const assignOrder = asyncHandler(async (req, res) => {
  const data = await orderService.assignOrder({
    orderId: req.params.id,
    actor: actorFromReq(req),
    staffId: req.body?.staffId ?? req.body?.staff_ID,
    note: req.body?.note,
  });
  return sendSuccess(res, 200, { order: data }, "Order assigned");
});

const patchOrderStatus = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrderStatus({
    orderId: req.params.id,
    actor: actorFromReq(req),
    status: req.body?.status,
  });
  return sendSuccess(res, 200, { order: data }, "Order status updated");
});

const cancelOrder = asyncHandler(async (req, res) => {
  const data = await orderService.cancelOrderByUser({
    orderId: req.params.id,
    actor: actorFromReq(req),
    note: req.body?.note,
  });
  return sendSuccess(res, 200, { order: data }, "Order cancelled");
});

const requestRefund = asyncHandler(async (req, res) => {
  const data = await orderService.requestRefundByUser({
    orderId: req.params.id,
    actor: actorFromReq(req),
    note: req.body?.note,
  });
  return sendSuccess(res, 200, { order: data }, "Refund request submitted");
});

const resolveRefund = asyncHandler(async (req, res) => {
  const data = await orderService.resolveRefundDecision({
    orderId: req.params.id,
    actor: actorFromReq(req),
    approved: Boolean(req.body?.approved),
    note: req.body?.note,
  });
  return sendSuccess(res, 200, { order: data }, "Refund request resolved");
});

const updateOrder = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrderByActor({
    orderId: req.params.id,
    actor: actorFromReq(req),
    body: req.body,
  });
  return sendSuccess(res, 200, data, "Order updated");
});

const getOrderMessages = asyncHandler(async (req, res) => {
  const rows = await orderService.listOrderMessages({
    orderId: req.params.id,
    actor: actorFromReq(req),
  });
  return sendSuccess(res, 200, rows, "OK");
});

const createOrderMessage = asyncHandler(async (req, res) => {
  const row = await orderService.createOrderMessage({
    orderId: req.params.id,
    actor: actorFromReq(req),
    message: req.body?.message,
  });
  return sendSuccess(res, 201, row, "Message sent");
});

const approveOrder = asyncHandler(async (req, res) => {
  const data = await orderService.updateOrderStatus({
    orderId: req.params.id,
    actor: actorFromReq(req),
    status: "confirmed",
  });
  return sendSuccess(res, 200, { order: data }, "Order confirmed");
});

export default {
  getAllOrders,
  getOrderById,
  getMyOrders,
  getUserOrders,
  getStaffOrders,
  createOrder,
  createOrders: createOrder, // backward compatibility
  assignOrder,
  patchOrderStatus,
  cancelOrder,
  requestRefund,
  resolveRefund,
  updateOrder,
  updateOrders: updateOrder, // backward compatibility
  getOrderMessages,
  createOrderMessage,
  approveOrder,
};
