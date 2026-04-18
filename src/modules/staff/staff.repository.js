import { Op } from "sequelize";
import models from "../../models/index.js";

const { Users, Orders } = models;

export const createStaffRepository = () => {
  const listUsers = async () => {
    return Users.findAll({
      include: {
        model: Orders,
        as: "orders",
        attributes: ["orderId", "total_Amount", "status"],
      },
      attributes: ["userId", "name", "email", "address", "phoneNumber", "roleID"],
    });
  };

  const findUserById = async (id) => Users.findByPk(id);

  const findUserByEmail = async (email) => Users.findOne({ where: { email } });

  const createUser = async (data) => Users.create(data);

  const updateUser = async (id, patch) => {
    const user = await Users.findByPk(id);
    if (!user) return null;
    await user.update(patch);
    return user;
  };

  const deleteUser = async (id) => {
    const user = await Users.findByPk(id);
    if (!user) return false;
    await user.destroy();
    return true;
  };

  /** roleID: "1" | "2" | "3" — used for admin↔staff directory */
  const listUsersByRoleId = async (roleID) => {
    const s = String(roleID ?? "").trim();
    // Legacy rows may store semantic strings (e.g. "staff") instead of "3"
    const where =
      s === "3"
        ? { roleID: { [Op.in]: ["3", "staff"] } }
        : s === "2"
          ? { roleID: { [Op.in]: ["2", "admin"] } }
          : s === "1"
            ? { roleID: { [Op.in]: ["1", "user", "customer"] } }
            : { roleID: s };
    return Users.findAll({
      where,
      attributes: ["userId", "name", "email", "roleID", "phoneNumber"],
      order: [["name", "ASC"]],
    });
  };

  return {
    listUsers,
    listUsersByRoleId,
    findUserById,
    findUserByEmail,
    createUser,
    updateUser,
    deleteUser,
  };
};

