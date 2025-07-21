// src/controller/ordersController.js
import ordersService from "../service/ordersService.js";

const getAllOrders = async (req, res) => {
  try {
    const orders = await ordersService.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrdersById = async (req, res) => {
  try {
    const orders = await ordersService.getOrdersById(req.params.id);
    res.status(200).json(orders);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

const createOrders = async (req, res) => {
  try {
    const newOrders = await ordersService.createOrders(req.body);
    res.status(201).json(newOrders);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
  getAllOrders,
  getOrdersById,
  createOrders,
  updateOrders,
  deleteOrders,
};
