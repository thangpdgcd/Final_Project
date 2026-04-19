import test from "node:test";
import assert from "node:assert/strict";
import { registerOrderSocket } from "./order.socket.js";
import { orderService } from "../../services/order.service.js";

const createSocketDouble = () => {
  const handlers = new Map();
  const emitted = [];
  const joined = [];
  return {
    id: "sock-1",
    data: { userId: 101, role: "customer", user: { id: 101, role: "customer" } },
    on: (event, handler) => handlers.set(event, handler),
    emit: (event, payload) => emitted.push({ event, payload }),
    join: (room) => joined.push(room),
    _handlers: handlers,
    _emitted: emitted,
    _joined: joined,
  };
};

const createIoDouble = () => {
  const outbound = [];
  return {
    to: (room) => ({
      emit: (event, payload) => {
        outbound.push({ room, event, payload });
      },
    }),
    _outbound: outbound,
  };
};

const events = {
  order: {
    send: "send_order",
    receive: "receive_order",
    updateStatus: "update_order_status",
    updated: "order_updated",
    joinRoom: "order:join",
    chatSend: "order:chat:send",
    chatReceive: "order:chat:receive",
  },
};

const rooms = {
  user: (id) => `user:${id}`,
  staff: () => "staff",
  order: (id) => `order:${id}`,
};

test("order:join joins order room and emits joined ack event", async () => {
  const socket = createSocketDouble();
  const io = createIoDouble();

  const original = orderService.getOrderByIdForActor;
  orderService.getOrderByIdForActor = async () => ({ orderId: 88, userId: 101 });
  try {
    registerOrderSocket({ io, socket, rooms, events });
    const handler = socket._handlers.get("order:join");
    assert.equal(typeof handler, "function");

    let ackPayload = null;
    await handler({ orderId: 88 }, (payload) => {
      ackPayload = payload;
    });

    assert.deepEqual(ackPayload, { ok: true, orderId: 88 });
    assert.deepEqual(socket._joined, ["order:88"]);
    assert.equal(socket._emitted.some((x) => x.event === "order:joined"), true);
    assert.equal(socket._emitted.some((x) => x.event === "order:join"), false);
  } finally {
    orderService.getOrderByIdForActor = original;
  }
});

test("order:chat:send persists and emits receive event to order room", async () => {
  const socket = createSocketDouble();
  const io = createIoDouble();

  const originalCreate = orderService.createOrderMessage;
  orderService.createOrderMessage = async () => ({
    id: 1,
    orderId: 55,
    senderId: 101,
    message: "hello",
  });

  try {
    registerOrderSocket({ io, socket, rooms, events });
    const handler = socket._handlers.get("order:chat:send");
    assert.equal(typeof handler, "function");

    let ackPayload = null;
    await handler({ orderId: 55, message: "hello" }, (payload) => {
      ackPayload = payload;
    });

    assert.equal(ackPayload?.ok, true);
    assert.equal(socket._joined.includes("order:55"), true);
    assert.equal(io._outbound.length, 1);
    assert.deepEqual(io._outbound[0], {
      room: "order:55",
      event: "order:chat:receive",
      payload: {
        orderId: 55,
        message: {
          id: 1,
          orderId: 55,
          senderId: 101,
          message: "hello",
        },
      },
    });
  } finally {
    orderService.createOrderMessage = originalCreate;
  }
});
