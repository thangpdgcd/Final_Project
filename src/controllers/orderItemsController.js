import { render } from "ejs";
import orderItemsService from "../service/orderItemsService.js";

let getAllOrderItems = async (req, res) => {
  try {
    let orderItems = await orderItemsService.getAllOrderItems();
    //render views orderItems.ejs with data
    console.log("check----", orderItems);
    return res.render("orderItems", { orderItems });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let getOrderItemsById = async (req, res) => {
  try {
    let id = req.params.id;
    let item = await orderItemsService.getOrderItemById(id);
    return res.status(200).json(item);
  } catch (error) {
    return res.status(404).json({ message: error.message });
  }
};

let createOrderItems = async (req, res) => {
  try {
    let data = req.body;
    let created = await orderItemsService.createOrderItem(data);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let updateOrderItems = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;
    let updated = await orderItemsService.updateOrderItem(id, data);
    return res.status(200).json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let deleteOrderItems = async (req, res) => {
  try {
    let id = req.params.id;
    let result = await orderItemsService.deleteOrderItem(id);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ✅ Đúng chuẩn export cho ES Modules
export default {
  createOrderItems,
  getAllOrderItems,
  getOrderItemsById,
  updateOrderItems,
  deleteOrderItems,
};
