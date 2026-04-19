import db from "./index.js";

/** Barrel: các model Sequelize dùng cho nghiệp vụ đơn hàng (đã khai báo trong cùng thư mục models/). */
const { Orders, Order_Items, Products, Users, OrderMeta, OrderChatMessage } = db;

export const orderModel = {
  Orders,
  Order_Items,
  Products,
  Users,
  OrderMeta,
  OrderChatMessage,
};

export default orderModel;
