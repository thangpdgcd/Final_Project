import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError.js";

export const createStaffService = ({ staffRepository }) => {
  const getAllUsers = async () => {
    return staffRepository.listUsers();
  };

  const getUserById = async (id) => {
    const user = await staffRepository.findUserById(id);
    if (!user) throw new AppError(404, "User does not exist");
    return user;
  };

  const createUser = async (data) => {
    const { name, email, address, phoneNumber, password, roleID } = data;
    if (!name || !email || !password) {
      throw new AppError(400, "Missing required information");
    }

    const emailNorm = String(email).trim().toLowerCase();

    const finalRoleID =
      roleID !== undefined && roleID !== null && String(roleID).trim() !== ""
        ? String(roleID)
        : "2";
    const safeRoleID = ["1", "2", "3"].includes(finalRoleID) ? finalRoleID : "2";

    const existingEmail = await staffRepository.findUserByEmail(emailNorm);
    if (existingEmail) throw new AppError(400, "Email already exists.");

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await staffRepository.createUser({
      name,
      email: emailNorm,
      address: address || "",
      phoneNumber: phoneNumber || "",
      password: passwordHash,
      roleID: safeRoleID,
      status: data.status || "active",
    });

    return newUser;
  };

  const updateUser = async (id, patch) => {
    const user = await staffRepository.updateUser(id, patch);
    if (!user) throw new AppError(404, "User does not exist");
    return user;
  };

  const deleteUser = async (id) => {
    const ok = await staffRepository.deleteUser(id);
    if (!ok) throw new AppError(404, "User does not exist");
    return null;
  };

  return {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
  };
};

