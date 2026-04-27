import express from "express";
import cors from "cors";
import session from "express-session";
import authRoutes from "./auth/routes.js";
import notesRoutes from "./notes/routes.js";

export function createApp() {
  const app = express();

  const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const SESSION_SECRET = process.env.SESSION_SECRET || "dev_session_secret_change_me";

  app.use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: true
  }));

  app.use(express.json());

  app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24
    }
  }));

  app.use("/api/auth", authRoutes);
  app.use("/api/notes", notesRoutes);

  app.get("/health", (req, res) => {
    res.json({
      status: "ok",
      service: "ssd-social-login-backend"
    });
  });

  return app;
}
