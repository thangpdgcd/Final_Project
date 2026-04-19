import { presenceManager } from "../chat/rooms/presence.manager.js";

export const presence = presenceManager;

export const listOnlineStaffIds = ({ resolveRoleById } = {}) => {
  const ids = presence.listOnlineUserIds();
  if (typeof resolveRoleById !== "function") return ids;
  return ids.filter((id) => {
    const role = resolveRoleById(id);
    return role === "staff";
  });
};

