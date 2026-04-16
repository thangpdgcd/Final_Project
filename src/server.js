// src/server.js
import http from "http";
import paypal from "paypal-rest-sdk";

import { createApp } from "./app.js";
import { loadEnv } from "./core/config/runtimeEnv.js";
import { initSocket } from "./core/socket/socket.init.js";
import { registerSocketModules } from "./infrastructure/socket/registerModules.js";
import { seedChatOnStartup } from "./modules/chat/chat.seed.js";

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
initSocket({ httpServer, registerModules: registerSocketModules });

const listenWithRetry = (startPort, maxAttempts = 10) => {
  let attempts = 0;
  let currentPort = startPort;

  const tryListen = () => {
    const onListening = () => {
      httpServer.off("error", onError);
      console.log(`✅ Server listening on: http://localhost:${currentPort}`);
      console.log(`Swagger UI: http://localhost:${currentPort}/api-docs`);
      console.log(`Socket.IO: ws://localhost:${currentPort}/socket.io/`);
      httpServer.ref?.();
    };

    const onError = (err) => {
      httpServer.off("listening", onListening);

      if (err?.code === "EADDRINUSE" && attempts < maxAttempts) {
        attempts += 1;
        console.warn(
          `⚠️ Port ${currentPort} is in use. Retrying on ${currentPort + 1}... (${attempts}/${maxAttempts})`,
        );
        currentPort += 1;
        setTimeout(tryListen, 150);
        return;
      }

      console.error("❌ Server listen error:", err);
      process.exitCode = 1;
    };

    httpServer.once("error", onError);
    httpServer.once("listening", onListening);
    httpServer.listen(currentPort, "0.0.0.0");
  };

  tryListen();
};

try {
  await seedChatOnStartup();
} catch (e) {
  console.error("[chat-seed] Failed:", e?.message || e);
}

listenWithRetry(PORT);

export default app;
