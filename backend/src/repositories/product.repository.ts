import type { Prisma, PrismaClient, StockMovementType } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getSkipTake, type Pagination } from "../utils/pagination";

type ListProductsInput = Pagination & {
  search?: string;
  category?: string;
};

export class ProductRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  private where({ search, category }: ListProductsInput): Prisma.ProductWhereInput {
    return {
      category: category ? { equals: category, mode: "insensitive" } : undefined,
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { sku: { contains: search, mode: "insensitive" } },
            { category: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    };
  }

  async list(input: ListProductsInput) {
    const where = this.where(input);
    const [data, total] = await this.db.$transaction([
      this.db.product.findMany({
        where,
        ...getSkipTake(input),
        orderBy: { updatedAt: "desc" }
      }),
      this.db.product.count({ where })
    ]);
    return { data, total };
  }

  findById(id: string) {
    return this.db.product.findUnique({
      where: { id },
      include: {
        stockLogs: {
          include: { createdBy: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "desc" },
          take: 50
        }
      }
    });
  }

  create(data: Prisma.ProductCreateInput) {
    return this.db.product.create({ data });
  }

  update(id: string, data: Prisma.ProductUpdateInput) {
    return this.db.product.update({ where: { id }, data });
  }

  lowStock() {
    return this.db.product.findMany({
      where: {
        currentStock: { lte: this.db.product.fields.minStockAlertQty }
      },
      orderBy: [{ currentStock: "asc" }, { name: "asc" }]
    });
  }

  createStockLog(input: {
    productId: string;
    quantityChanged: number;
    movementType: StockMovementType;
    reason: string;
    createdById: string;
  }) {
    return this.db.stockLog.create({ data: input });
  }
}

export const productRepository = new ProductRepository();

