import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

import swaggerSpec from "./config/swagger.js";
import configViewEngine from "./config/viewEngine.js";
import { buildCorsMiddleware } from "./config/corsConfig.js";
import initRoutes from "./routes/index.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { sendError } from "./utils/response.js";

export const createApp = () => {
  const app = express();

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
    next();
  });

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
  app.options(/.*/, corsMiddleware);

  configViewEngine(app);
  initRoutes(app);

  const swaggerOptions = {
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "full",
    },
  };

  app.get("/openapi.json", (req, res) => res.json(swaggerSpec));
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerOptions),
  );

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

