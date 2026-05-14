import { Router, type IRouter } from "express";
import { logger } from "../../lib/logger";

const ISIPULSA_HOST = "isipulsa.web.id";
const APP_VERSION_CODE = "250608";
const APP_VERSION_NAME = "25.06.08";

const router: IRouter = Router();

async function isipulsaPost(path: string, params: Record<string, string>): Promise<Record<string, unknown>> {
  const body = new URLSearchParams({
    app_version_code: APP_VERSION_CODE,
    app_version_name: APP_VERSION_NAME,
    ...params,
  }).toString();

  // Note: fetch auto-decompresses gzip — don't set accept-encoding manually
  const resp = await fetch(`https://${ISIPULSA_HOST}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      "user-agent": "okhttp/4.12.0",
    },
    body,
  });

  return resp.json() as Promise<Record<string, unknown>>;
}

// Step 1: username + password → mungkin butuh OTP
router.post("/pulsa/login", async (req, res): Promise<void> => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    res.status(400).json({ error: "Username dan password wajib diisi" });
    return;
  }

  try {
    const data = await isipulsaPost("/api/v2/login", { username, password });
    req.log.info({ username, data }, "isipulsa login step1");

    // Cek apakah butuh OTP
    const results = data.results as Record<string, unknown> | undefined;
    if (data.success && results?.otp) {
      res.json({
        needOtp: true,
        otpType: String(results.otp),          // "email" atau "sms"
        otpHint: String(results.otp_value ?? ""),
        username,
        message: `Kode OTP dikirim ke ${results.otp_value ?? results.otp}`,
      });
      return;
    }

    // Login langsung tanpa OTP
    const token =
      (data.auth_token as string) ??
      (data.token as string) ??
      (data.access_token as string) ??
      ((data.user as Record<string, string>)?.auth_token) ??
      ((data.user as Record<string, string>)?.token) ??
      ((data.data as Record<string, string>)?.auth_token) ??
      ((data.data as Record<string, string>)?.token) ??
      null;

    if (!data.success || !token) {
      res.status(401).json({ error: String(data.message ?? "Login gagal") });
      return;
    }

    res.json({
      username: String(data.username ?? username),
      token: String(token),
      balance: data.balance != null ? Number(data.balance) : null,
      message: String(data.message ?? "Login berhasil"),
    });
  } catch (err) {
    logger.error({ err }, "isipulsa login error");
    res.status(500).json({ error: "Gagal menghubungi server isipulsa" });
  }
});

// Step 2: verifikasi OTP
router.post("/pulsa/login/verify-otp", async (req, res): Promise<void> => {
  const { username, password, otp } = req.body ?? {};
  if (!username || !password || !otp) {
    res.status(400).json({ error: "Username, password, dan OTP wajib diisi" });
    return;
  }

  try {
    const data = await isipulsaPost("/api/v2/login", { username, password, otp });
    req.log.info({ username, data }, "isipulsa login otp");

    const token =
      (data.auth_token as string) ??
      (data.token as string) ??
      (data.access_token as string) ??
      ((data.user as Record<string, string>)?.auth_token) ??
      ((data.user as Record<string, string>)?.token) ??
      ((data.data as Record<string, string>)?.auth_token) ??
      ((data.data as Record<string, string>)?.token) ??
      null;

    if (!data.success || !token) {
      res.status(401).json({ error: String(data.message ?? "OTP salah atau expired") });
      return;
    }

    res.json({
      username: String(data.username ?? username),
      token: String(token),
      balance: data.balance != null ? Number(data.balance) : null,
      message: String(data.message ?? "Login berhasil"),
    });
  } catch (err) {
    logger.error({ err }, "isipulsa otp verify error");
    res.status(500).json({ error: "Gagal menghubungi server isipulsa" });
  }
});

export default router;
