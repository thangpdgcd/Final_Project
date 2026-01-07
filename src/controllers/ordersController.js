// src/controller/ordersController.js
import ordersService from "../service/ordersService.js";

const getOrderById = async (req, res) => {
  try {
    let orders = await ordersService.getOrderById(req.params.id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createOrders = async (req, res) => {
  try {
    const { user_ID } = req.body;
    if (!user_ID) return res.status(400).json({ message: "Missing user_ID" });

    const order = await ordersService.createOrders(user_ID);
    res.status(201).json({ message: "Order created  successfully", order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrders = async (req, res) => {
  try {
    const updatedOrders = await ordersService.updateOrder(
      req.params.id,
      req.body
    );
    res.status(200).json(updatedOrders);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deleteOrders = async (req, res) => {
  try {
    const result = await ordersService.deleteOrders(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  getOrderById,
  createOrders,
  updateOrders,
  deleteOrders,
};
