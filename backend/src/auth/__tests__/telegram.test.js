import crypto from "crypto";
import {
  buildDisplayName,
  isAuthDateFresh,
  verifyTelegramAuth
} from "../telegram.js";

function buildValidPayload(payload, botToken) {
  const checkString = Object.keys(payload)
    .sort()
    .map((key) => `${key}=${payload[key]}`)
    .join("\n");

  const secretKey = crypto
    .createHash("sha256")
    .update(botToken)
    .digest();

  const hash = crypto
    .createHmac("sha256", secretKey)
    .update(checkString)
    .digest("hex");

  return {
    ...payload,
    hash
  };
}

describe("Telegram auth utils", () => {
  const botToken = "test_bot_token";

  test("valid Telegram payload passes hash verification", () => {
    const payload = buildValidPayload(
      {
        id: 123456789,
        first_name: "Sergey",
        last_name: "Knyazkin",
        username: "poeticlama",
        photo_url: "https://t.me/i/userpic/320/example.jpg",
        auth_date: Math.floor(Date.now() / 1000)
      },
      botToken
    );

    expect(verifyTelegramAuth(payload, botToken)).toBe(true);
  });

  test("invalid Telegram hash fails verification", () => {
    const payload = buildValidPayload(
      {
        id: 123456789,
        first_name: "Sergey",
        auth_date: Math.floor(Date.now() / 1000)
      },
      botToken
    );

    const tamperedPayload = {
      ...payload,
      first_name: "Hacker"
    };

    expect(verifyTelegramAuth(tamperedPayload, botToken)).toBe(false);
  });

  test("old auth_date fails freshness check", () => {
    const oldAuthDate = Math.floor(Date.now() / 1000) - 90000;

    expect(isAuthDateFresh(oldAuthDate)).toBe(false);
  });

  test("fresh auth_date passes freshness check", () => {
    const freshAuthDate = Math.floor(Date.now() / 1000);

    expect(isAuthDateFresh(freshAuthDate)).toBe(true);
  });

  test("buildDisplayName joins first_name and last_name", () => {
    expect(buildDisplayName({
      id: 123,
      first_name: "Sergey",
      last_name: "Knyazkin",
      username: "poeticlama"
    })).toBe("Sergey Knyazkin");
  });

  test("buildDisplayName falls back to username", () => {
    expect(buildDisplayName({
      id: 123,
      username: "poeticlama"
    })).toBe("poeticlama");
  });
});
