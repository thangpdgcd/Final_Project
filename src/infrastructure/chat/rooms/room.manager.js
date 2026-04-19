const toId = (value) => String(value);

export const roomManager = {
  user: (userId) => `user:${toId(userId)}`,
  staff: () => "staff",
  admin: () => "admin",
  role: (role) => `role:${toId(role)}`,
  conversation: (conversationId) => `conversation:${toId(conversationId)}`,
  order: (orderId) => `order:${toId(orderId)}`,
};

export const joinDefaultRooms = ({ socket, userId, role }) => {
  if (userId != null && userId !== "") {
    socket.join(roomManager.user(userId));
  }
  if (role === "staff") {
    socket.join(roomManager.staff());
  }
  if (role === "admin") {
    socket.join(roomManager.admin());
  }
};
