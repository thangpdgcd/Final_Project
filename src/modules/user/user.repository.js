import models from "../../models/index.js";

const { Users } = models;

export const createUserRepository = () => {
  const findById = async (id) => Users.findByPk(id);

  const updateById = async (id, patch) => {
    const user = await Users.findByPk(id);
    if (!user) return null;
    await user.update(patch);
    return user;
  };

  return { findById, updateById };
};

