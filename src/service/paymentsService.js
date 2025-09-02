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
        return reject(new Error("Missing required data to create Payment."));
      }

      let orderItem = await Order_Items.findOne({
        where: { orderitem_ID: Order_Items_ID },
      });

      if (!orderItem) {
        return reject(
          new Error(`Order_Item not found with ID: ${Order_Items_ID}`)
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
      reject(new Error("Unable to create Payment: " + error.message));
    }
  });
};

let getAllPayments = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let payments = await Payments.findAll();
      resolve(payments);
    } catch (error) {
      reject(new Error("Unable to retrieve Payment list: " + error.message));
    }
  });
};

let getPaymentsById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payment = await Payments.findOne({
        where: { payment_ID: id },
      });

      if (!payment) {
        return reject(new Error(`Payment not found with ID: ${id}`));
      }

      resolve(payment);
    } catch (error) {
      reject(new Error("Error retrieving Payment: " + error.message));
    }
  });
};

let updatePayments = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payment = await Payments.findOne({ where: { payment_ID: id } });

      if (!payment) {
        return reject(new Error(`Payment not found with ID: ${id}`));
      }

      await payment.update(data);
      resolve(payment);
    } catch (error) {
      reject(new Error("Unable to update Payment: " + error.message));
    }
  });
};

let deletePayments = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payment = await Payments.findOne({ where: { payment_ID: id } });

      if (!payment) {
        return reject(new Error(`Payment not found with ID: ${id}`));
      }

      await payment.destroy();
      resolve({ message: "Payment deleted successfully." });
    } catch (error) {
      reject(new Error("Unable to delete Payment: " + error.message));
    }
  });
};

let searchPayments = (name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let payment = await Payments.findAll({
        where: {
          name: name,
        },
      });
      resolve(payment);
    } catch (error) {
      reject(new Error("Unable to search user: " + error.message));
    }
  });
};

export default {
  createPayments,
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
  searchPayments,
};
