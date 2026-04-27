import { prisma } from "../db/prisma.js";

const usersCount = await prisma.user.count();
const loginEventsCount = await prisma.loginEvent.count();
const notesCount = await prisma.note.count();

console.log({
  usersCount,
  loginEventsCount,
  notesCount
});

await prisma.$disconnect();
