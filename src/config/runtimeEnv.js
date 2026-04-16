import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

let loaded = false;

const resolveBackendRootEnvPath = () => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  // src/config/runtimeEnv.js -> backend root /.env
  return path.resolve(__dirname, "../../.env");
};

export const loadEnv = () => {
  if (loaded) return;
  loaded = true;

  const envPath = resolveBackendRootEnvPath();
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
  } else if (process.env.NODE_ENV !== "production") {
    console.warn("⚠️ Missing .env file at:", envPath);
  }
};

export const requireEnv = (key) => {
  const val = process.env[key];
  if (val == null || String(val).trim() === "") {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return val;
};

export const readIntEnv = (key, fallback) => {
  const raw = process.env[key];
  if (raw == null || String(raw).trim() === "") return fallback;
  const n = Number.parseInt(String(raw), 10);
  return Number.isFinite(n) ? n : fallback;
};
