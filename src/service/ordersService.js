import db from "../models/index.js";
let { Orders, Cart_Items, Carts, Users, Order_Items } = db;

const getOrderById = async (order_ID) => {
  try {
    console.log("🔍 Searching order_ID:", order_ID);
    const orders = await Orders.findByPk(order_ID, {
      include: {
        model: Users,
        as: "users",
        attributes: ["user_ID", "name", "email"],
      },
    });

    if (!orders) {
      throw new Error("Order not found");
    }

    return orders;
  } catch (error) {
    throw new Error("Error retrieving order: " + error.message);
  }
};

const createOrders = async (user_ID, opts = {}) => {
  if (!user_ID) throw new Error("Missing user_ID");

  const {
    status = "Pending",
    paymentMethod = null,
    paypalCaptureId = null,
  } = opts;

  const cart = await Carts.findOne({
    where: { user_ID },
    include: [{ model: Cart_Items, as: "cart_Items" }],
  });

  if (!cart) throw new Error("Cart not found");
  if (!cart.cart_Items || cart.cart_Items.length === 0)
    throw new Error("Cart is empty");

  const totalAmount = cart.cart_Items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const order = await Orders.create({
    user_ID,
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
      order_ID: order.order_ID,
      product_ID: item.product_ID,
      quantity: item.quantity,
      price: item.price,
    });
  }

  await Cart_Items.destroy({ where: { cart_ID: cart.cart_ID } });

  return order;
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

let searchOrders = async ({ user_ID, status }) => {
  return new Promise(async (resolve, reject) => {
    try {
      let whereClause = {};
      if (user_ID) {
        whereClause.user_ID = user_ID;
      } else if (status) {
        whereClause.status = status;
      } else {
        return reject(new Error("Please provide user_ID or status to search"));
      }
      let orders = await Orders.findAll({ where: whereClause });
      resolve(orders);
    } catch (error) {
      reject(new Error("Unable to search orders: " + error.message));
    }
  });
};

export default {
  getOrderById,
  createOrders,
  updateOrder,
  deleteOrder,
  searchOrders,
};
