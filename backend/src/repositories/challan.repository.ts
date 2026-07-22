import type { ChallanStatus, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getSkipTake, type Pagination } from "../utils/pagination";

type ListChallansInput = Pagination & {
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
};

export class ChallanRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  private where(input: ListChallansInput): Prisma.ChallanWhereInput {
    return {
      status: input.status,
      customerId: input.customerId,
      OR: input.search
        ? [
            { challanNumber: { contains: input.search, mode: "insensitive" } },
            { customer: { name: { contains: input.search, mode: "insensitive" } } },
            { customer: { businessName: { contains: input.search, mode: "insensitive" } } }
          ]
        : undefined
    };
  }

  async list(input: ListChallansInput) {
    const where = this.where(input);
    const [data, total] = await this.db.$transaction([
      this.db.challan.findMany({
        where,
        ...getSkipTake(input),
        include: {
          customer: { select: { id: true, name: true, businessName: true } },
          createdBy: { select: { id: true, name: true, role: true } },
          _count: { select: { items: true } }
        },
        orderBy: { createdAt: "desc" }
      }),
      this.db.challan.count({ where })
    ]);
    return { data, total };
  }

  findById(id: string) {
    return this.db.challan.findUnique({
      where: { id },
      include: {
        customer: true,
        createdBy: { select: { id: true, name: true, role: true } },
        items: {
          include: { product: { select: { id: true, name: true, sku: true, currentStock: true } } },
          orderBy: { snapshotName: "asc" }
        }
      }
    });
  }
}

export const challanRepository = new ChallanRepository();

