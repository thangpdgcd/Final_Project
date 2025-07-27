import paymentService from "../service/paymentsService.js";

let getAllPayments = async (req, res) => {
  try {
    let payments = await paymentService.getAllPayments();
    res.render("payments", { payments }); // nếu dùng EJS
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let getPaymentsById = async (req, res) => {
  try {
    let id = req.params.id;
    let payment = await paymentService.getPaymentsById(id);
    return res.status(200).json(payment);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};
let createPayments = async (req, res) => {
  try {
    let data = req.body;
    let payment = await paymentService.createPayments(data);
    return res.json(payment); // trả về JSON nếu dùng API
    // nếu dùng EJS
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

let updatePayments = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;
    let payment = await paymentService.updatePayments(id, data);
    return res.status(200).json(payment);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

let deletePayments = async (req, res) => {
  try {
    let id = req.params.id;
    let result = await paymentService.deletePayments(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export default {
  createPayments,
  getAllPayments,
  getPaymentsById,
  updatePayments,
  deletePayments,
};
