// File: api/index.js
import app from "../backend/src/server.js"; // đường dẫn tới Express app bạn export
import { createServer } from "http";

const server = createServer(app);

export default function handler(req, res) {
  server.emit("request", req, res);
}
