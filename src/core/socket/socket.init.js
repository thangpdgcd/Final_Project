import { attachSocketServer } from "../../infrastructure/socket/socketServer.js";

export const initSocket = ({ httpServer, registerModules }) => {
  return attachSocketServer(httpServer, { registerModules });
};
