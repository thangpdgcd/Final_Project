import { requireEnv } from "./runtimeEnv.js";

const readTikTokClientKey = () => {
  // Backward-compatible: some setups use TIKTOK_CLIENT_ID, spec uses TIKTOK_CLIENT_KEY.
  const key = process.env.TIKTOK_CLIENT_KEY || process.env.TIKTOK_CLIENT_ID;
  if (key == null || String(key).trim() === "") {
    throw new Error("Missing required environment variable: TIKTOK_CLIENT_KEY");
  }
  return String(key).trim();
};

export const getTikTokConfig = () => {
  return {
    clientKey: readTikTokClientKey(),
    clientSecret: requireEnv("TIKTOK_CLIENT_SECRET"),
    redirectUri: requireEnv("TIKTOK_REDIRECT_URI"),
    authorizeUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    scope: "user.info.basic",
  };
};

