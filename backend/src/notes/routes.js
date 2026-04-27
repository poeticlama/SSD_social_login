import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma.js";
import { requireCurrentUser } from "../auth/routes.js";

const router = Router();

const noteSchema = z.object({
  title: z.string().trim().min(1).max(100),
  content: z.string().trim().min(1).max(1000)
});

router.get("/", requireCurrentUser, async (req, res) => {
  const notes = await prisma.note.findMany({
    where: {
      userId: req.currentUser.id
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return res.json({
    items: notes.map((note) => ({
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    }))
  });
});

router.post("/", requireCurrentUser, async (req, res) => {
  const parseResult = noteSchema.safeParse(req.body);

  if (!parseResult.success) {
    return res.status(400).json({
      error: "INVALID_PAYLOAD",
      details: parseResult.error.flatten()
    });
  }

  const note = await prisma.note.create({
    data: {
      userId: req.currentUser.id,
      title: parseResult.data.title,
      content: parseResult.data.content
    }
  });

  return res.status(201).json({
    item: {
      id: note.id,
      title: note.title,
      content: note.content,
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString()
    }
  });
});

router.delete("/:id", requireCurrentUser, async (req, res) => {
  const noteId = Number(req.params.id);

  if (!Number.isInteger(noteId)) {
    return res.status(400).json({
      error: "INVALID_NOTE_ID"
    });
  }

  const note = await prisma.note.findFirst({
    where: {
      id: noteId,
      userId: req.currentUser.id
    }
  });

  if (!note) {
    return res.status(404).json({
      error: "NOTE_NOT_FOUND"
    });
  }

  await prisma.note.delete({
    where: {
      id: note.id
    }
  });

  return res.json({
    message: "Note deleted successfully"
  });
});

export default router;
