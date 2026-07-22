import { Prisma, type PrismaClient, type StockMovementType } from "@prisma/client";
import { InsufficientStockError, NotFoundError } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import { productRepository } from "../repositories/product.repository";
import { paged } from "../utils/pagination";

type ListProductsInput = {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
};

type StockMovementInput = {
  productId: string;
  quantity: number;
  movementType: StockMovementType;
  reason: string;
  createdById: string;
};

export class ProductService {
  async list(input: ListProductsInput) {
    const { data, total } = await productRepository.list(input);
    return paged(data, total, input.page, input.pageSize);
  }

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) throw new NotFoundError("Product not found");
    return product;
  }

  create(input: {
    name: string;
    sku: string;
    category: string;
    unitPrice: number;
    currentStock: number;
    minStockAlertQty: number;
    location: string;
  }) {
    return productRepository.create({
      ...input,
      unitPrice: new Prisma.Decimal(input.unitPrice)
    });
  }

  async update(
    id: string,
    input: Partial<{
      name: string;
      sku: string;
      category: string;
      unitPrice: number;
      currentStock: number;
      minStockAlertQty: number;
      location: string;
    }>
  ) {
    await this.getById(id);
    return productRepository.update(id, {
      ...input,
      unitPrice: input.unitPrice === undefined ? undefined : new Prisma.Decimal(input.unitPrice)
    });
  }

  lowStock() {
    return productRepository.lowStock();
  }

  async recordStockMovement(input: StockMovementInput) {
    return prisma.$transaction(async (tx) => {
      await this.applyStockDelta(tx, {
        productId: input.productId,
        quantity: input.quantity,
        movementType: input.movementType,
        reason: input.reason,
        createdById: input.createdById
      });

      return tx.product.findUniqueOrThrow({
        where: { id: input.productId },
        include: { stockLogs: { orderBy: { createdAt: "desc" }, take: 10 } }
      });
    });
  }

  async applyStockDelta(
    tx: Prisma.TransactionClient | PrismaClient,
    input: StockMovementInput
  ) {
    const quantityChanged = input.movementType === "OUT" ? -input.quantity : input.quantity;
    const updateResult = await tx.product.updateMany({
      where: {
        id: input.productId,
        ...(input.movementType === "OUT" ? { currentStock: { gte: input.quantity } } : {})
      },
      data: {
        currentStock: { increment: quantityChanged }
      }
    });

    if (updateResult.count !== 1) {
      throw new InsufficientStockError(input.productId, input.quantity);
    }

    return tx.stockLog.create({
      data: {
        productId: input.productId,
        quantityChanged,
        movementType: input.movementType,
        reason: input.reason,
        createdById: input.createdById
      }
    });
  }
}

export const productService = new ProductService();

