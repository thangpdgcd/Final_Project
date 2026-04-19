import models from "../models/index.js";

const { Users, Sequelize } = models;

export const createAuthRepository = () => {
  const findByEmail = async (email) => {
    return Users.findOne({
      where: { email },
    });
  };

  const existsByEmail = async (email) => {
    const user = await Users.findOne({
      where: { [Sequelize.Op.or]: [{ email }] },
      attributes: ["userId"],
    });
    return Boolean(user);
  };

  const createUser = async ({ name, email, address, phoneNumber, passwordHash, roleID }) => {
    return Users.create({
      name,
      email,
      address,
      phoneNumber,
      password: passwordHash,
      roleID,
    });
  };

  const findById = async (id) => {
    return Users.findByPk(id);
  };

  const updatePasswordHash = async ({ userId, passwordHash }) => {
    return Users.update(
      { password: passwordHash },
      {
        where: { userId: Number(userId) },
      },
    );
  };

  return {
    findByEmail,
    existsByEmail,
    createUser,
    findById,
    updatePasswordHash,
  };
};

