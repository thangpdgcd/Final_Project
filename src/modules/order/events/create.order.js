export const emitReceiveOrder = ({ io, rooms, events, order }) => {
  if (!io || !rooms || !events || !order) return;
  io.to(rooms.staff()).emit(events.order.receive, order);
};

export default { emitReceiveOrder };
