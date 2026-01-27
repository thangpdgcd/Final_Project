import usersService from "../../src/service/usersServices.js"; // Import the user service

let getAllUsers = async (req, res) => {
  try {
    let { name } = req.query;

    if (name) {
      let result = await usersService.searchUsers(name);
      return res.status(200).json(result);
    }

    let users = await usersService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

let getUsersbyID = async (req, res) => {
  try {
    let id = req.params.id;
    let users = await usersService.getUsersById(id);
    res.status(200).json(users);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

let createAdmin = async (req, res) => {
  try {
    let data = req.body;
    let newUsers = await usersService.createAdmin(data);
    res.status(201).json(newUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let updateUsers = async (req, res) => {
  try {
    let id = req.params.id;
    let data = req.body;
    let updatedUsers = await usersService.updateUsers(id, data);
    res.status(200).json(updatedUsers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

let deleteUsers = async (req, res) => {
  try {
    let id = req.params.id;
    await usersService.deleteUsers(id);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default {
  getAllUsers,
  getUsersbyID,
  createAdmin,
  updateUsers,
  deleteUsers,
};
