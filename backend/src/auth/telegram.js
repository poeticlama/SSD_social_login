import crypto from "crypto";

export function verifyTelegramAuth(payload, botToken) {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const { hash, ...data } = payload;

  if (!hash || typeof hash !== "string") {
    return false;
  }

  if (!botToken || typeof botToken !== "string") {
    return false;
  }

  const checkString = Object.keys(data)
    .filter((key) => data[key] !== undefined && data[key] !== null)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(botToken)
    .digest();

  const calculatedHash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  const calculatedBuffer = Buffer.from(calculatedHash, "hex");
  const receivedBuffer = Buffer.from(hash, "hex");

  if (calculatedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(calculatedBuffer, receivedBuffer);
}

export function isAuthDateFresh(authDate, maxAgeSeconds = 86400) {
  if (!authDate) {
    return false;
  }

  const authTimestamp = Number(authDate);

  if (!Number.isFinite(authTimestamp)) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);

  if (authTimestamp > now) {
    return false;
  }

  return now - authTimestamp <= maxAgeSeconds;
}

export function buildDisplayName(payload) {
  const firstName = payload.first_name || "";
  const lastName = payload.last_name || "";

  const displayName = `${firstName} ${lastName}`.trim();

  return displayName || payload.username || `Telegram user ${payload.id}`;
}
