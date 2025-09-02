import db from "../models/index.js";

let { Order_Items, Orders, Products } = db;

let createOrderItem = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { Orders_ID, Products_ID, Quantity, Price } = data;

      if (!Orders_ID || !Products_ID || !Quantity || !Price) {
        return reject(new Error("Missing required data to create Order_Item."));
      }

      const orderItem = await Order_Items.create({
        Orders_ID,
        Products_ID,
        Quantity,
        Price,
      });

      resolve(orderItem);
    } catch (error) {
      reject(new Error("Unable to create Order_Item: " + error.message));
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
    throw new Error("Unable to retrieve Order_Items list: " + error.message);
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
      throw new Error("Order_Item not found");
    }
    return item;
  } catch (error) {
    throw new Error("Error retrieving Order_Item: " + error.message);
  }
};

let updateOrderItem = async (id, data) => {
  try {
    let item = await Order_Items.findByPk(id);
    if (!item) {
      throw new Error("Order_Item does not exist");
    }
    let updatedItem = await item.update(data);
    return updatedItem;
  } catch (error) {
    throw new Error("Unable to update Order_Item: " + error.message);
  }
};

let deleteOrderItem = async (id) => {
  try {
    let item = await Order_Items.findByPk(id);
    if (!item) {
      throw new Error("Order_Item does not exist");
    }
    await item.destroy();
    return { message: "Deleted successfully" };
  } catch (error) {
    throw new Error("Unable to delete Order_Item: " + error.message);
  }
};

let searchOrderItem = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let orderItem = await Order_Items.findAll({
        where: {
          name: name,
        },
      });
      resolve(orderItem);
    } catch (error) {
      reject(new Error("Unable to search user: " + error.message));
    }
  });
};
export default {
  createOrderItem,
  getAllOrderItems,
  getOrderItemById,
  updateOrderItem,
  deleteOrderItem,
  searchOrderItem,
};
