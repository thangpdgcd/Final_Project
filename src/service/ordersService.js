import db from "../models/index.js";

const { Orders, Users } = db;

const getAllOrders = async () => {
  try {
    const orders = await Orders.findAll({
      include: {
        model: Users,
        as: "users",
        attributes: ["user_ID", "name", "email"],
      },
    });
    return orders;
  } catch (error) {
    throw new Error("Unable to retrieve order list: " + error.message);
  }
};

const getOrderById = async (Orderid) => {
  try {
    const orders = await Orders.findByPk(Orderid, {
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

const createOrders = async (data) => {
  try {
    const { user_ID, total_Amount, status, shipping_Address } = data;

    const users = await Users.findOne({ where: { user_ID: user_ID } });
    if (!users) {
      throw new Error("User does not exist");
    }

    const newOrders = await Orders.create({
      user_ID,
      total_Amount,
      status,
      shipping_Address,
    });

    return newOrders;
  } catch (error) {
    throw new Error("Unable to create order: " + error.message);
  }
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
  getAllOrders,
  getOrderById,
  createOrders,
  updateOrder,
  deleteOrder,
  searchOrders,
};
