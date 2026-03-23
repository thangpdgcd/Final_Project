import db from "../models/index.js";
let { Orders, Cart_Items, Carts, Users, Order_Items } = db;

const getAllOrders = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      let orders = await Orders.findAll({
        include: {
          model: Users,
          as: "users",
          attributes: ["userId", "name", "email"],
        },
      });
      resolve(orders);
    } catch (error) {
      reject(new Error("Error retrieving orders: " + error.message));
    }
  });
};
const getOrderById = async (orderId) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("🔍 Searching orderId:", orderId);
      const orders = await Orders.findByPk(orderId, {
        include: {
          model: Users,
          as: "users",
          attributes: ["userId", "name", "email"],
        },
      });

      if (!orders) {
        throw new Error("Order not found");
      }

      return orders;
    } catch (error) {
      throw new Error("Error retrieving order: " + error.message);
    }
  });
};

const createOrders = async (userId, opts = {}) => {
  return new Promise(async (resolve, reject) => {
    if (!userId) throw new Error("Missing userId");
    const {
      status = "Pending",
      paymentMethod = null,
      paypalCaptureId = null,
    } = opts;

    const cart = await Carts.findOne({
      where: { userId },
      include: [{ model: Cart_Items, as: "cart_Items" }],
    });

    if (!cart) throw new Error("Cart not found");
    if (!cart.cart_Items || cart.cart_Items.length === 0)
      throw new Error("Cart is empty");

    const totalAmount = cart.cart_Items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await Orders.create({
      userId,
      total_Amount: totalAmount,
      status, // ✅ Paid hoặc Pending
      shipping_Address: "Chưa cập nhật",

      // ✅ nếu DB có cột thì lưu thêm
      payment_Method: paymentMethod,
      paypal_Capture_Id: paypalCaptureId,
      paid_At: status === "Paid" ? new Date() : null,
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

    return order;
  });
};

const updateOrder = async (updateOrderid, data) => {
  try {
    const orders = await Orders.findByPk(updateOrderid);
    if (!orders) {
      throw new Error("Order not found");
    }

    await orders.update(data);
    return orders;
  } catch (error) {
    throw new Error("Unable to update order: " + error.message);
  }
};

const deleteOrder = async (deleteOrderid) => {
  try {
    const order = await Orders.findByPk(deleteOrderid);
    if (!order) {
      throw new Error("Order not found");
    }

    await order.destroy();
    return { message: "Order deleted successfully" };
  } catch (error) {
    throw new Error("Unable to delete order: " + error.message);
  }
};

let searchOrders = async ({ userId, status }) => {
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
  getOrderById,
  createOrders,
  updateOrder,
  deleteOrder,
  searchOrders,
};
