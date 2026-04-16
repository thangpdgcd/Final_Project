import { AppError } from "../../utils/AppError.js";

export const createUserService = ({ userRepository }) => {
  const updateProfile = async ({ userId, name, phoneNumber, address }) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    const patch = {
      name: name || user.name,
      phoneNumber: phoneNumber || user.phoneNumber,
      address: address || user.address,
    };

    const updated = await userRepository.updateById(userId, patch);
    return { user: updated };
  };

  const setAvatar = async ({ userId, avatarUrl }) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new AppError(404, "User not found");

    if (!Object.prototype.hasOwnProperty.call(user.dataValues, "avatar")) {
      return {
        avatarUrl,
        note: "Avatar uploaded (avatar field not configured on model).",
      };
    }

    await userRepository.updateById(userId, { avatar: avatarUrl });
    return { avatarUrl };
  };

  return { updateProfile, setAvatar };
};

