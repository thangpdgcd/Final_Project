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

  const findOrCreateGoogleUser = async ({
    email,
    name,
    avatar,
    roleID = "1",
    passwordHash,
  }) => {
    const emailNorm = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!emailNorm) return null;

    const existing = await Users.findOne({ where: { email: emailNorm } });
    if (existing) {
      await existing.update({
        name: typeof name === "string" && name.trim() ? name.trim() : existing.name,
        avatar: typeof avatar === "string" && avatar.trim() ? avatar.trim() : existing.avatar,
        provider: "google",
      });
      return existing;
    }

    return Users.create({
      name: typeof name === "string" && name.trim() ? name.trim() : "Google User",
      email: emailNorm,
      address: null,
      phoneNumber: null,
      password: passwordHash,
      roleID: String(roleID || "1"),
      provider: "google",
      avatar: typeof avatar === "string" && avatar.trim() ? avatar.trim() : null,
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
    findOrCreateGoogleUser,
    findById,
    updatePasswordHash,
  };
};

