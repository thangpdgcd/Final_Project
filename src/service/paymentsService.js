import db from "../models/index.js";

let { Payments, Order_Items } = db;

let createPayments = (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let {
        Order_Items_ID,
        Payment_Method,
        Payment_Status,
        Amount,
        Paid,
        Transaction_ID,
      } = data;

      if (
        !Order_Items_ID ||
        !Payment_Method ||
        !Amount ||
        typeof Paid === "undefined"
      ) {
        return reject(new Error("Thiếu dữ liệu bắt buộc để tạo Payment."));
      }

      let orderItem = await Order_Items.findOne({
        where: { Order_Items_ID: Order_Items_ID },
      });

      if (!orderItem) {
        return reject(
          new Error(`Không tìm thấy Order_Item với ID: ${Order_Items_ID}`)
        );
      }

      let newPayment = await Payments.create({
        Order_Items_ID,
        Payment_Method,
        Payment_Status: Payment_Status || "pending",
        Amount,
        Paid,
        Transaction_ID: Transaction_ID || null,
      });

      resolve(newPayment);
    } catch (error) {
      reject(new Error("Không thể tạo Payment: " + error.message));
    }
  });
};
let getAllPayments = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let payments = await Payments.findAll();
      resolve(payments);
    } catch (error) {
      reject(new Error("Không thể lấy danh sách Payment: " + error.message));
    }
  });
};

let getPaymentsById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payment = await Payments.findOne({
        where: { Payments_ID: id },
      });

      if (!payment) {
        return reject(new Error(`Không tìm thấy Payment với ID: ${id}`));
      }

      resolve(payment);
    } catch (error) {
      reject(new Error("Lỗi khi lấy Payment: " + error.message));
    }
  });
};

let updatePayments = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payment = await Payments.findOne({ where: { Payments_ID: id } });

      if (!payment) {
        return reject(new Error(`Không tìm thấy Payment với ID: ${id}`));
      }

      await payment.update(data);
      resolve(payment);
    } catch (error) {
      reject(new Error("Không thể cập nhật Payment: " + error.message));
    }
  });
};

let deletePayments = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payment = await Payments.findOne({ where: { Payments_ID: id } });

      if (!payment) {
        return reject(new Error(`Không tìm thấy Payment với ID: ${id}`));
      }

      await payment.destroy();
      resolve({ message: "Xóa Payment thành công." });
    } catch (error) {
      reject(new Error("Không thể xóa Payment: " + error.message));
    }
  });
};

export default {
  createPayments,
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
};
