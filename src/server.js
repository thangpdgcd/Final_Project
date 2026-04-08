// src/server.js
import express from "express";
import http from "http";
import dotenv from "dotenv";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import paypal from "paypal-rest-sdk";

import configViewEngine from "./config/viewEngine.js";
import { buildCorsMiddleware } from "./config/corsConfig.js";
import initRoutes from "./routes/index.js";
import { attachSocket } from "./socket/socket.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { sendError } from "./utils/response.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Always load `.env` (ignore NODE_ENV).
const loadedEnvPath = path.resolve(__dirname, "../.env");
if (fs.existsSync(loadedEnvPath)) {
  dotenv.config({ path: loadedEnvPath, override: true });
} else {
  console.warn("⚠️ Missing .env file at:", loadedEnvPath);
}

if (process.env.NODE_ENV !== "production") {
  console.log("ENV FILE:", loadedEnvPath);
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

const app = express();
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
const DEFAULT_PORT = 8080;
const basePort = Number.parseInt(process.env.PORT ?? "", 10);
const PORT = Number.isFinite(basePort) ? basePort : DEFAULT_PORT;

// middlewares
// Express 5 router may not reach later `(err, req, res, next)` handlers for JSON parse
// failures from `express.json()`. Wrap the parser so invalid JSON always returns JSON 400.
const jsonParser = express.json({ limit: "50mb" });
app.use((req, res, next) => {
  jsonParser(req, res, (err) => {
    if (!err) return next();
    const badBody =
      err.type === "entity.parse.failed" ||
      (Number(err.status) === 400 &&
        (err instanceof SyntaxError || /JSON/i.test(String(err.message || ""))));
    if (badBody) {
      return sendError(
        res,
        400,
        "Request body must be valid JSON (use double quotes for keys/strings).",
        null,
      );
    }
    return next(err);
  });
});
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

const corsMiddleware = buildCorsMiddleware();
app.use(corsMiddleware);

// Express 5 (path-to-regexp v6) does not support the bare "*" path.
// Use a regex route so preflight requests are handled for all paths.
app.options(/.*/, corsMiddleware);

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

configViewEngine(app);
initRoutes(app);

const httpServer = http.createServer(app);
attachSocket(httpServer);

const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    docExpansion: "full",
  },
};

// Useful for tools like Rapidoc / manual testing (and for your `homeapi.ejs`).
app.get("/openapi.json", (req, res) => res.json(swaggerSpec));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptions));

app.use(notFoundHandler);
app.use(errorHandler);

const listenWithRetry = (startPort, maxAttempts = 10) => {
  let attempts = 0;
  let currentPort = startPort;

  const tryListen = () => {
    httpServer.listen(currentPort, "0.0.0.0", () => {
      console.log(`✅ Server listening on: http://localhost:${currentPort}`);
      console.log(`Swagger UI: http://localhost:${currentPort}/api-docs`);
      console.log(`Socket.IO: ws://localhost:${currentPort}/socket.io/`);
    });

    httpServer.on("error", (err) => {
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
    });

    httpServer.ref?.();
  };

  tryListen();
};

listenWithRetry(PORT);

export default app;
