/**
 * Refund flows are implemented in the order module (`requestRefundByUser`, `resolveRefundDecision`).
 * Re-export for a clear domain entry when importing refund behavior.
 */
export { orderService as refundOrderService } from "../order/order.service.js";
