import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import {
  buildDisplayName,
  isAuthDateFresh,
  verifyTelegramAuth
} from "./telegram.js";

const router = Router();

const telegramAuthSchema = z.object({
  id: z.number(),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  username: z.string().optional(),
  photo_url: z.string().url().optional(),
  auth_date: z.number(),
  hash: z.string()
});

function formatUser(user) {
  return {
    id: user.id,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
    provider: user.provider,
    providerUserId: user.providerUserId,
    lastLoginAt: user.lastLoginAt.toISOString()
  };
}

async function requireCurrentUser(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.session.userId }
  });

  if (!user) {
    req.session.destroy(() => {});
    return res.status(401).json({ error: "UNAUTHORIZED" });
  }

  req.currentUser = user;
  next();
}

router.post("/telegram", async (req, res) => {
  const parseResult = telegramAuthSchema.safeParse(req.body);

  if (!parseResult.success) {
    await prisma.loginEvent.create({
      data: {
        provider: "telegram",
        success: false,
        reason: "INVALID_PAYLOAD"
      }
    });

    return res.status(400).json({
      error: "INVALID_PAYLOAD",
      details: parseResult.error.flatten()
    });
  }

  const payload = parseResult.data;
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  const isHashValid = verifyTelegramAuth(payload, botToken);
  const isFresh = isAuthDateFresh(payload.auth_date);

  if (!isHashValid || !isFresh) {
    await prisma.loginEvent.create({
      data: {
        provider: "telegram",
        success: false,
        reason: !isHashValid ? "INVALID_TELEGRAM_AUTH" : "AUTH_DATE_EXPIRED"
      }
    });

    return res.status(401).json({
      error: !isHashValid ? "INVALID_TELEGRAM_AUTH" : "AUTH_DATE_EXPIRED"
    });
  }

  const providerUserId = String(payload.id);
  const now = new Date();

  const user = await prisma.user.upsert({
    where: {
      provider_providerUserId: {
        provider: "telegram",
        providerUserId
      }
    },
    update: {
      displayName: buildDisplayName(payload),
      username: payload.username || null,
      avatarUrl: payload.photo_url || null,
      lastLoginAt: now
    },
    create: {
      displayName: buildDisplayName(payload),
      username: payload.username || null,
      avatarUrl: payload.photo_url || null,
      provider: "telegram",
      providerUserId,
      lastLoginAt: now
    }
  });

  await prisma.loginEvent.create({
    data: {
      provider: "telegram",
      success: true,
      reason: "LOGIN_SUCCESS",
      userId: user.id
    }
  });

  req.session.userId = user.id;

  return res.json({
    user: formatUser(user),
    securityChecks: [
      "Telegram hash verified",
      "auth_date checked",
      "User loaded by verified Telegram ID",
      "Login event saved",
      "HttpOnly session cookie created"
    ]
  });
});

router.get("/me", requireCurrentUser, async (req, res) => {
  return res.json({
    user: formatUser(req.currentUser),
    securityChecks: [
      "Session cookie checked",
      "User loaded from local session"
    ]
  });
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    return res.json({
      message: "Logged out successfully"
    });
  });
});

router.get("/login-events", requireCurrentUser, async (req, res) => {
  const items = await prisma.loginEvent.findMany({
    where: {
      OR: [
        { userId: req.currentUser.id },
        { userId: null }
      ]
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 20
  });

  return res.json({
    items: items.map((item) => ({
      id: item.id,
      provider: item.provider,
      success: item.success,
      reason: item.reason,
      createdAt: item.createdAt.toISOString()
    }))
  });
});

export { requireCurrentUser };
export default router;
