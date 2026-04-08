import db from "../models/index.js";
import { emitOrderNew, emitOrderUpdate } from "../socket/socket.js";
import { AppError } from "../utils/AppError.js";

const { Orders, Cart_Items, Carts, Users, Order_Items, Products } = db;

const userIsStaffOrAdmin = async (userId) => {
  if (userId == null || userId === "") return false;
  const row = await Users.findByPk(userId, { attributes: ["roleID"] });
  if (!row) return false;
  const rid = String(row.roleID ?? "").trim();
  return rid === "2" || rid === "3";
};

const orderListInclude = [
  {
    model: Users,
    as: "users",
    attributes: ["userId", "name", "email", "phoneNumber"],
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

const getAllOrders = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let orders = await Orders.findAll({
        include: orderListInclude,
        order: [["createdAt", "DESC"]],
      });
      resolve(orders);
    } catch (error) {
      reject(new Error("Error retrieving orders: " + error.message));
    }
  });
};

const getOrdersByUserId = async (userId) => {
  if (userId == null || userId === "") {
    throw new Error("Missing userId");
  }
  const uid = Number(userId);
  if (!Number.isFinite(uid)) {
    throw new Error("Invalid userId");
  }
  return Orders.findAll({
    where: { userId: uid },
    include: orderListInclude,
    order: [["createdAt", "DESC"]],
  });
};
const getOrderById = async (orderId) => {
  try {
    const orders = await Orders.findByPk(orderId, {
      include: [
        {
          model: Users,
          as: "users",
          attributes: ["userId", "name", "email", "phoneNumber"],
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
      ],
    });

    if (!orders) {
      throw new AppError("Order not found", 404);
    }

    return orders;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Error retrieving order: " + error.message, 500);
  }
};

const createOrders = async (userId, opts = {}) => {
  if (!userId) throw new AppError("Missing userId", 400);
  const { status: rawStatus = "pending" } = opts;
  const status = String(rawStatus).trim() || "pending";

  const cart = await Carts.findOne({
    where: { userId },
    include: [{ model: Cart_Items, as: "cart_Items" }],
  });

  if (!cart) throw new AppError("Cart not found", 400);
  if (!cart.cart_Items || cart.cart_Items.length === 0) {
    throw new AppError("Cart is empty", 400);
  }

  const totalAmount = cart.cart_Items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const order = await Orders.create({
    userId,
    total_Amount: totalAmount,
    status,
    shipping_Address: "Not set",
  });

  for (const item of cart.cart_Items) {
    await Order_Items.create({
      orderId: order.orderId,
      productId: item.productId,
      quantity: item.quantity,
      price: item.price,
    });
  }

  await Cart_Items.destroy({ where: { cartId: cart.cartId } });

  const full = await getOrderById(order.orderId);
  emitOrderNew(full);
  return full;
};

const updateOrder = async (updateOrderid, data) => {
  try {
    const orders = await Orders.findByPk(updateOrderid);
    if (!orders) {
      throw new AppError("Order not found", 404);
    }

    await orders.update(data);
    const full = await getOrderById(updateOrderid);
    emitOrderUpdate(full);
    return full;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Unable to update order: " + error.message, 400);
  }
};

const updateOrderWithGuards = async (orderId, body, actorUserId) => {
  const data = { ...(body || {}) };
  if (data.status !== undefined) {
    const ok = await userIsStaffOrAdmin(actorUserId);
    if (!ok) {
      throw new AppError(
        "Only staff or admin can update order status. User must have roleID 2 (admin) or 3 (staff).",
        403,
      );
    }
    const next = String(data.status).toLowerCase();
    if (next === "confirmed") {
      const order = await Orders.findByPk(orderId);
      if (!order) throw new AppError("Order not found", 404);
      const cur = String(order.status ?? "").toLowerCase();
      if (cur !== "pending") {
        throw new AppError(
          `Order is not pending (current: ${order.status})`,
          409,
        );
      }
    }
  }
  return updateOrder(orderId, data);
};

const approveOrder = async (orderId, approverId) => {
  const order = await Orders.findByPk(orderId);
  if (!order) throw new AppError("Order not found", 404);

  const currentStatus = order.status ?? order.Status;
  const normalized =
    typeof currentStatus === "string" ? currentStatus.toLowerCase() : "";

  if (normalized !== "pending") {
    throw new AppError(
      `Order is not pending (current: ${currentStatus})`,
      409,
    );
  }

  const updateData = { status: "confirmed" };
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
  const full = await getOrderById(orderId);
  emitOrderUpdate(full);
  return full;
};

const deleteOrder = async (deleteOrderid) => {
  try {
    const order = await Orders.findByPk(deleteOrderid);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    await order.destroy();
    return { message: "Order deleted successfully" };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError("Unable to delete order: " + error.message, 400);
  }
};

const searchOrders = async ({ userId, status }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let whereClause = {};
      if (userId) {
        whereClause.userId = userId;
      } else if (status) {
        whereClause.status = status;
      } else {
        return reject(new Error("Please provide userId or status to search"));
      }
      let orders = await Orders.findAll({ where: whereClause });
      resolve(orders);
    } catch (error) {
      reject(new Error("Unable to search orders: " + error.message));
    }
  });
};

export default {
  getAllOrders,
  getOrdersByUserId,
  getOrderById,
  createOrders,
  updateOrder,
  updateOrderWithGuards,
  approveOrder,
  deleteOrder,
  deleteOrders: deleteOrder,
  searchOrders,
};
