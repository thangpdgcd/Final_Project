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

function isNonProduction() {
  return process.env.NODE_ENV !== "production";
}

/** True if hostname is loopback (IPv4, IPv6, or "localhost"). */
function isLoopbackHostname(hostname) {
  if (!hostname) return false;
  const h = hostname.toLowerCase();
  if (h === "localhost" || h === "127.0.0.1") return true;
  // IPv6 loopback from URL API: hostname is "[::1]"
  if (h === "[::1]" || h === "::1") return true;
  return false;
}

/** Private LAN (RFC1918) — common when opening the app via http://192.168.x.x:5173 from phone/other PC. */
function isPrivateLanHostname(hostname) {
  if (!hostname || hostname.includes(":")) return false; // skip IPv6 (handled above)
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (!m) return false;
  const a = Number(m[1]);
  const b = Number(m[2]);
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * In non-production, allow http(s) from loopback or private LAN without listing every IP in ALLOWED_ORIGINS.
 */
function isPermissiveDevOrigin(origin) {
  if (!isNonProduction()) return false;
  if (typeof origin !== "string") return false;
  try {
    const u = new URL(origin);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return isLoopbackHostname(u.hostname) || isPrivateLanHostname(u.hostname);
  } catch {
    return false;
  }
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
  const strictDev = process.env.CORS_STRICT_DEVELOPMENT === "true";
  const prod = process.env.NODE_ENV === "production";

  if (!prod && !strictDev) {
    console.log(
      "[CORS] Development: allowing all Origins (set NODE_ENV=production or CORS_STRICT_DEVELOPMENT=true to restrict).",
    );
  }

  return cors({
    // Production + strict dev: whitelist. Default dev: allow any Origin (avoids tunnel / .local / odd hosts).
    origin: (origin, callback) => {
      // Allow requests without Origin header (e.g. curl, swagger tooling).
      if (!origin) return callback(null, true);

      const requested =
        typeof origin === "string" ? origin.trim() : String(origin);

      if (!prod && !strictDev) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(requested)) return callback(null, true);
      if (isVercelOrigin(requested)) return callback(null, true);
      if (!prod && isPermissiveDevOrigin(requested)) return callback(null, true);

      if (isNonProduction()) {
        console.warn("[CORS] Blocked origin:", requested);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Auth-Mode"],
    sameSite: 'none', //set cookie sameSite to none to allow cross-site requests
    httpOnly: true, //set cookie httpOnly to true to prevent cross-site scripting attacks 
      
    secure: true,
  });
}
