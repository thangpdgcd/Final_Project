import crypto from "crypto";
import { getTikTokConfig } from "../config/tiktok.js";
import { createTikTokAuthService } from "../services/tiktokAuth.service.js";

const buildAuthorizeUrl = ({ clientKey, redirectUri, scope, state }) => {
  const u = new URL("https://www.tiktok.com/v2/auth/authorize/");
  u.searchParams.set("client_key", clientKey);
  u.searchParams.set("scope", scope);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("state", state);
  return u.toString();
};

const stateCookieOptions = (req) => {
  const isSecure =
    req.secure ||
    req.headers["x-forwarded-proto"] === "https" ||
    process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isSecure,
    sameSite: isSecure ? "none" : "lax",
    maxAge: 10 * 60 * 1000,
    path: "/",
  };
};

export const createTikTokAuthController = () => {
  const tiktokService = createTikTokAuthService();

  const redirectToTikTok = async (req, res) => {
    try {
      const cfg = getTikTokConfig();
      const state = crypto.randomBytes(16).toString("hex");

      res.cookie("tiktok_oauth_state", state, stateCookieOptions(req));

      const url = buildAuthorizeUrl({
        clientKey: cfg.clientKey,
        redirectUri: cfg.redirectUri,
        scope: cfg.scope,
        state,
      });

      return res.redirect(url);
    } catch (e) {
      console.error("[tiktok][auth] redirect error:", e?.message || e);
      return res.status(500).json({ success: false, message: "TikTok auth failed" });
    }
  };

  const handleTikTokCallback = async (req, res) => {
    try {
      const code = typeof req.query?.code === "string" ? req.query.code.trim() : "";
      const state = typeof req.query?.state === "string" ? req.query.state.trim() : "";
      const expectedState = typeof req.cookies?.tiktok_oauth_state === "string"
        ? req.cookies.tiktok_oauth_state.trim()
        : "";

      if (!code) return res.status(400).json({ success: false, message: "Missing code" });
      if (!state || !expectedState || state !== expectedState) {
        return res.status(400).json({ success: false, message: "Invalid state" });
      }

      // One-time use: clear state cookie after validation
      res.clearCookie("tiktok_oauth_state", { path: "/" });

      const tokenResponse = await tiktokService.exchangeCodeForToken({ code });

      const accessToken =
        tokenResponse?.access_token ||
        tokenResponse?.data?.access_token ||
        tokenResponse?.data?.accessToken;

      if (!accessToken) {
        console.log("[tiktok][token] missing access_token payload:", tokenResponse);
        return res.status(500).json({ success: false, message: "Missing access token" });
      }

      const userInfo = await tiktokService.fetchUserInfo({ accessToken });

      return res.json({
        success: true,
        token: accessToken,
        data: userInfo,
      });
    } catch (e) {
      console.error("[tiktok][callback] error:", e?.message || e);
      return res.status(500).json({ success: false, message: "TikTok callback failed" });
    }
  };

  return { redirectToTikTok, handleTikTokCallback };
};

