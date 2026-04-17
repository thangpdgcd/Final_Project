export const emitOrderUpdated = ({ io, rooms, events, order }) => {
  if (!io || !rooms || !events || !order) return;
  const userId = order?.userId ?? order?.user_ID;
  if (userId != null && userId !== "") {
    io.to(rooms.user(userId)).emit(events.order.updated, order);
  }
  io.to(rooms.staff()).emit(events.order.updated, order);
};

export default { emitOrderUpdated };
