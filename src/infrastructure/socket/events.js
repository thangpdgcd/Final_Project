export const events = {
  order: {
    update: "order:update",
    created: "order:new",
    send: "send_order",
    receive: "receive_order",
    updateStatus: "update_order_status",
    updated: "order_updated",
    cancelled: "order_cancelled",
    completed: "order_completed",
    joinRoom: "order:join",
    chatSend: "order:chat:send",
    chatReceive: "order:chat:receive",
  },
  chat: {
    typing: "chat:typing",
    join: "chat:join",
    message: "chat:message",
  },
};

