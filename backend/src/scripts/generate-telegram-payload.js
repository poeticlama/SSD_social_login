import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const botToken = process.env.TELEGRAM_BOT_TOKEN;

const payload = {
  id: 123456789,
  first_name: "Sergey",
  last_name: "Knyazkin",
  username: "poeticlama",
  photo_url: "https://t.me/i/userpic/320/example.jpg",
  auth_date: Math.floor(Date.now() / 1000)
};

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

console.log(JSON.stringify({ ...payload, hash }, null, 2));
