import axios from "axios";
import { getTikTokConfig } from "../config/tiktok.js";

export const createTikTokAuthService = () => {
  const exchangeCodeForToken = async ({ code }) => {
    const cfg = getTikTokConfig();

    const body = {
      client_key: cfg.clientKey,
      client_secret: cfg.clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: cfg.redirectUri,
    };

    const res = await axios.post(cfg.tokenUrl, body, {
      headers: { "Content-Type": "application/json" },
      timeout: 15_000,
      validateStatus: () => true,
    });

    console.log("[tiktok][token] status:", res.status);
    console.log("[tiktok][token] data:", res.data);

    if (res.status < 200 || res.status >= 300) {
      const msg =
        (res.data && (res.data.message || res.data.error_description || res.data.error)) ||
        "TikTok token exchange failed";
      const err = new Error(msg);
      err.statusCode = 500;
      err.details = res.data;
      throw err;
    }

    return res.data;
  };

  // Optional: TikTok user info endpoint (may require additional scopes / products)
  const fetchUserInfo = async ({ accessToken }) => {
    const url = "https://open.tiktokapis.com/v2/user/info/";

    const res = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 15_000,
      validateStatus: () => true,
      params: {
        fields: "open_id,union_id,avatar_url,display_name,profile_deep_link",
      },
    });

    console.log("[tiktok][user] status:", res.status);
    console.log("[tiktok][user] data:", res.data);

    if (res.status < 200 || res.status >= 300) {
      return null;
    }

    return res.data;
  };

  return { exchangeCodeForToken, fetchUserInfo };
};

