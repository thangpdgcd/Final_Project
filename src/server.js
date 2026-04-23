// src/server.js
import http from "http";
import paypal from "paypal-rest-sdk";

import { createApp } from "./app.js";
import { loadEnv } from "./config/runtimeEnv.js";
import { attachSocketServer } from "./infrastructure/socket/socketServer.js";
import { registerSocketModules } from "./infrastructure/socket/registerModules.js";
import { seedChatOnStartup } from "./scripts/seedChat.js";

loadEnv();

if (process.env.NODE_ENV !== "production") {
  console.log("NODE_ENV:", process.env.NODE_ENV ?? "(undefined)");
}
console.log(
  "PAYPAL_CLIENT_ID:",
  process.env.PAYPAL_CLIENT_ID ? "✅ OK" : "❌ MISSING",
);

if (process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
    console.error(
      "JWT_SECRET and REFRESH_TOKEN_SECRET are required in production.",
    );
    process.exit(1);
  }
} else if (!process.env.JWT_SECRET || !process.env.REFRESH_TOKEN_SECRET) {
  console.warn(
    "JWT_SECRET and REFRESH_TOKEN_SECRET should be set in .env for authentication.",
  );
}

const app = createApp();
const DEFAULT_PORT = 8080;
const basePort = Number.parseInt(process.env.PORT ?? "", 10);
const PORT = Number.isFinite(basePort) ? basePort : DEFAULT_PORT;

if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
  console.error("❌ Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET in .env");
} else {
  paypal.configure({
    mode: "sandbox",
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    limit: "50mb",
  });
  console.log("✅ PayPal configured");
}

const httpServer = http.createServer(app);
attachSocketServer(httpServer, { registerModules: registerSocketModules });

const isBackendAlreadyRunning = async (port) => {
  const url = `http://127.0.0.1:${port}/api/health`;
  const timeoutMs = 800;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
};

const listenOnPort = (port) => {
  const onListening = () => {
    httpServer.off("error", onError);
    console.log(`✅ Server listening on: http://localhost:${port}`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
    console.log(`Socket.IO: ws://localhost:${port}/socket.io/`);
    httpServer.ref?.();
  };

  const onError = (err) => {
    httpServer.off("listening", onListening);
    if (err?.code === "EADDRINUSE") {
      // If our backend is already running, exit cleanly to avoid “port in use” noise
      // when the dev server is started twice.
      isBackendAlreadyRunning(port)
        .then((ok) => {
          if (ok) {
            console.log(`ℹ️ Backend is already running on port ${port}.`);
            process.exit(0);
          }
          console.error(
            `❌ Port ${port} is alreadys in use by another process. Stop it, then restart the backend.`,
          );
          process.exit(1);
        })
        .catch(() => {
          console.error(
            `❌ Port ${port} is already in use. Stop the process using it, then restart the backend.`,
          );
          process.exit(1);
        });
      return;
    }
    console.error("❌ Server listen error:", err);
    process.exitCode = 1;
  };

  httpServer.once("error", onError);
  httpServer.once("listening", onListening);
  httpServer.listen(port, "0.0.0.0");
};

try {
  await seedChatOnStartup();
} catch (e) {
  console.error("[chat-seed] Failed:", e?.message || e);
}

listenOnPort(PORT);

export default app;
