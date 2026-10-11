
import { PrismaClient } from "@prisma/client";

// Reuse one Prisma Client instance during development.
// This prevents Next.js hot reloads from creating too many connections.

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

// Cache the client globally during development.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
