import type { PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";

export class UserRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  findByEmail(email: string) {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string) {
    return this.db.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
  }
}

export const userRepository = new UserRepository();

