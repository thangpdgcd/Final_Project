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

  return {
    listUsers,
    findUserById,
    findUserByEmail,
    createUser,
    updateUser,
    deleteUser,
  };
};

