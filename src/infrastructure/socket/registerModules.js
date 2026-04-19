import { createChatRepository } from "../../services/chat.repository.js";
import { createChatService } from "../../services/chat.service.js";
import { registerChatSocket } from "./chat.socket.js";
import { registerOrderSocket } from "./order.socket.js";
import { createUserRepository } from "../../services/user.repository.js";
import { createStaffRepository } from "../../services/staff.repository.js";
import { registerVoucherSocket } from "./voucher.socket.js";
import { registerStaffInternalSocket } from "./staff.internal.socket.js";

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

