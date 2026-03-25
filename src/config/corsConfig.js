import cors from "cors";

const fallbackOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
];

function isVercelOrigin(origin) {
  // Allow Vercel preview/production domains without requiring env changes.
  // Examples:
  // - https://my-app.vercel.app
  // - https://my-app-git-main.vercel.app
  return (
    typeof origin === "string" &&
    (origin.endsWith(".vercel.app") || origin.endsWith(".vercel.dev"))
  );
}

// tránh bị sập server
function parseAllowedOriginsFromEnv(envValue) {
  if (!envValue || typeof envValue !== "string") return fallbackOrigins;

  const parsed = envValue
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return parsed.length ? parsed : fallbackOrigins;
}

export function buildCorsMiddleware() {
  // Build-time read so dotenv in `server.js` is guaranteed to run first.
  const allowedOrigins = parseAllowedOriginsFromEnv(process.env.ALLOWED_ORIGINS);

  return cors({
    // Do NOT use origin: '*' for security. Use strict whitelist instead.
    origin: (origin, callback) => {
      // Allow requests without Origin header (e.g. curl, swagger tooling).
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) return callback(null, true);
      if (isVercelOrigin(origin)) return callback(null, true);

      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Auth-Mode"],
  });
}
