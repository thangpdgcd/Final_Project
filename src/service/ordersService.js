// src/service/ordersService.js
import db from "../models/index.js";

const { Orders, Users } = db;

const getAllOrders = async () => {
  try {
    const orders = await Orders.findAll({
      include: {
        model: Users,
        as: "users",
        attributes: ["Users_ID", "Name", "Email"],
      },
    });
    return orders;
  } catch (error) {
    throw new Error("Không thể lấy danh sách đơn hàng: " + error.message);
  }
};

const getOrderById = async (Orderid) => {
  try {
    const orders = await Orders.findByPk(Orderid, {
      include: {
        model: Users,
        as: "users",
        attributes: ["Users_ID", "Name", "Email"],
      },
    });

    if (!orders) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    return orders;
  } catch (error) {
    throw new Error("Lỗi khi lấy đơn hàng: " + error.message);
  }
};

const createOrders = async (data) => {
  try {
    const { User_ID, Total_Amount, Status, Shipping_Address } = data;

    // Kiểm tra người dùng tồn tại
    const users = await Users.findOne({ where: { Users_ID: User_ID } });
    if (!users) {
      throw new Error("Người dùng không tồn tại");
    }

    const newOrders = await Orders.create({
      User_ID,
      Total_Amount,
      Status,
      Shipping_Address,
    });

    return newOrders;
  } catch (error) {
    throw new Error("Không thể tạo đơn hàng: " + error.message);
  }
};

const updateOrder = async (UpdateOrderid, data) => {
  try {
    const orders = await Orders.findByPk(UpdateOrderid);
    if (!orders) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    await orders.update(data);
    return orders;
  } catch (error) {
    throw new Error("Không thể cập nhật đơn hàng: " + error.message);
  }
};

const deleteOrder = async (DeleteOrderid) => {
  try {
    const order = await Orders.findByPk(DeleteOrderid);
    if (!order) {
      throw new Error("Không tìm thấy đơn hàng");
    }

    await order.destroy();
    return { message: "Đã xóa đơn hàng thành công" };
  } catch (error) {
    throw new Error("Không thể xóa đơn hàng: " + error.message);
  }
};

export default {
  getAllOrders,
  getOrderById,
  createOrders,
  updateOrder,
  deleteOrder,
};
