import { createChatRepository } from "../../modules/chat/chat.repository.js";
import { createChatService } from "../../modules/chat/chat.service.js";
import { registerChatSocket } from "../../modules/chat/chat.socket.js";
import { createUserRepository } from "../../modules/user/user.repository.js";
import { createStaffRepository } from "../../modules/staff/staff.repository.js";

export const registerSocketModules = ({ io, socket, rooms, events }) => {
  const chatRepository = createChatRepository();
  const userRepository = createUserRepository();
  const staffRepository = createStaffRepository();
  const chatService = createChatService({ chatRepository, userRepository, staffRepository });
  registerChatSocket({ io, socket, rooms, events, chatService });
};

