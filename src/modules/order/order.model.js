import db from "../../models/index.js";

const { Orders, Order_Items, Products, Users, OrderMeta, OrderMessages } = db;

export const orderModel = {
  Orders,
  Order_Items,
  Products,
  Users,
  OrderMeta,
  OrderMessages,
};

export default orderModel;
