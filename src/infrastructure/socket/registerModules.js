import { createChatRepository } from "../../modules/chat/chat.repository.js";
import { createChatService } from "../../modules/chat/chat.service.js";
import { registerChatSocket } from "../../modules/chat/chat.socket.js";
import { registerOrderSocket } from "../../modules/order/order.socket.js";
import { createUserRepository } from "../../modules/user/user.repository.js";
import { createStaffRepository } from "../../modules/staff/staff.repository.js";
import { registerVoucherSocket } from "../../sockets/voucher.socket.js";
import { registerStaffInternalSocket } from "../../modules/staff/staff.internal.socket.js";

export const registerSocketModules = ({ io, socket, rooms, events }) => {
  const chatRepository = createChatRepository();
  const userRepository = createUserRepository();
  const staffRepository = createStaffRepository();
  const chatService = createChatService({ chatRepository, userRepository, staffRepository });
  registerChatSocket({ io, socket, rooms, events, chatService });
  registerOrderSocket({ io, socket, rooms, events });
  registerVoucherSocket({ io, socket, rooms, events });
  registerStaffInternalSocket({ io, socket, rooms, events });
};

