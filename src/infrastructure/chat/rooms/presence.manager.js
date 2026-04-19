const onlineByUserId = new Map();

export const presenceManager = {
  onConnect: ({ userId, role, socketId }) => {
    const uid = String(userId);
    const set = onlineByUserId.get(uid) ?? new Set();
    set.add(String(socketId));
    onlineByUserId.set(uid, set);
    return { userId: uid, role };
  },

  onDisconnect: ({ userId, socketId }) => {
    const uid = userId == null ? null : String(userId);
    if (!uid) return;
    const set = onlineByUserId.get(uid);
    if (!set) return;
    set.delete(String(socketId));
    if (set.size === 0) onlineByUserId.delete(uid);
  },

  isOnline: (userId) => {
    const uid = userId == null ? "" : String(userId);
    const set = onlineByUserId.get(uid);
    return Boolean(set && set.size > 0);
  },

  listOnlineUserIds: () =>
    Array.from(onlineByUserId.keys())
      .map((x) => Number(x))
      .filter(Number.isFinite),
};
