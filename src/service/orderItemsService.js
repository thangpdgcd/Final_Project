import db from "../models/index.js";

let { Order_Items, Orders, Products } = db;

let createOrderItem = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { Orders_ID, Products_ID, Quantity, Price } = data;

      // Kiểm tra dữ liệu bắt buộc
      if (!Orders_ID || !Products_ID || !Quantity || !Price) {
        return reject(new Error("Thiếu dữ liệu bắt buộc để tạo Order_Item."));
      }

      // Tạo Order_Item
      const orderItem = await Order_Items.create({
        Orders_ID,
        Products_ID,
        Quantity,
        Price,
      });

      resolve(orderItem);
    } catch (error) {
      reject(new Error("Không thể tạo Order_Item: " + error.message));
    }
  });
};

let getAllOrderItems = async () => {
  try {
    let items = await Order_Items.findAll({
      include: [
        { model: Orders, as: "orders" },
        { model: Products, as: "products" },
      ],
    });
    return items;
  } catch (error) {
    throw new Error("Không thể lấy danh sách Order_Items: " + error.message);
  }
};

let getOrderItemById = async (id) => {
  try {
    let item = await Order_Items.findByPk(id, {
      include: [
        { model: Orders, as: "orders" },
        { model: Products, as: "products" },
      ],
    });
    if (!item) {
      throw new Error("Không tìm thấy Order_Item");
    }
    return item;
  } catch (error) {
    throw new Error("Lỗi khi lấy Order_Item: " + error.message);
  }
};

let updateOrderItem = async (id, data) => {
  try {
    let item = await Order_Items.findByPk(id);
    if (!item) {
      throw new Error("Order_Item không tồn tại");
    }
    let updatedItem = await item.update(data);
    return updatedItem;
  } catch (error) {
    throw new Error("Không thể cập nhật Order_Item: " + error.message);
  }
};

let deleteOrderItem = async (id) => {
  try {
    let item = await Order_Items.findByPk(id);
    if (!item) {
      throw new Error("Order_Item không tồn tại");
    }
    await item.destroy();
    return { message: "Đã xóa thành công" };
  } catch (error) {
    throw new Error("Không thể xóa Order_Item: " + error.message);
  }
};

export default {
  createOrderItem,
  getAllOrderItems,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
};
