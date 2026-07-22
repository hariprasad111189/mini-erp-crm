import { ChallanStatus, Prisma } from "@prisma/client";
import { AppError, NotFoundError } from "../errors/app-error";
import { prisma } from "../lib/prisma";
import { challanRepository } from "../repositories/challan.repository";
import { productService } from "./product.service";
import { paged } from "../utils/pagination";

type CreateChallanInput = {
  customerId: string;
  status: "DRAFT" | "CONFIRMED";
  items: Array<{
    productId: string;
    quantity: number;
  }>;
};

type ListChallansInput = {
  page: number;
  pageSize: number;
  search?: string;
  status?: ChallanStatus;
  customerId?: string;
};

/** Neon + concurrent confirmations need headroom beyond Prisma's 5s default. */
const TX_OPTIONS = { maxWait: 20_000, timeout: 30_000 } as const;

export class ChallanService {
  async list(input: ListChallansInput) {
    const { data, total } = await challanRepository.list(input);
    return paged(data, total, input.page, input.pageSize);
  }

  async getById(id: string) {
    const challan = await challanRepository.findById(id);
    if (!challan) throw new NotFoundError("Challan not found");
    return challan;
  }

  async create(input: CreateChallanInput, createdById: string) {
    return prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: input.customerId } });
      if (!customer) throw new NotFoundError("Customer not found");

      const mergedItems = this.mergeLineItems(input.items);
      const productIds = mergedItems.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } }
      });
      const productsById = new Map(products.map((product) => [product.id, product]));

      if (productsById.size !== productIds.length) {
        throw new NotFoundError("One or more products were not found");
      }

      const items = mergedItems.map((item) => {
        const product = productsById.get(item.productId);
        if (!product) throw new NotFoundError("Product not found");
        return {
          productId: product.id,
          quantity: item.quantity,
          snapshotName: product.name,
          snapshotSku: product.sku,
          snapshotPrice: product.unitPrice
        };
      });

      if (input.status === "CONFIRMED") {
        for (const item of mergedItems) {
          await productService.applyStockDelta(tx, {
            productId: item.productId,
            quantity: item.quantity,
            movementType: "OUT",
            reason: "Sales challan confirmed",
            createdById
          });
        }
      }

      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalAmount = items.reduce(
        (sum, item) => sum.plus(item.snapshotPrice.mul(item.quantity)),
        new Prisma.Decimal(0)
      );

      return tx.challan.create({
        data: {
          challanNumber: this.generateChallanNumber(),
          customerId: input.customerId,
          status: input.status,
          totalQty,
          totalAmount,
          createdById,
          confirmedAt: input.status === "CONFIRMED" ? new Date() : undefined,
          items: { create: items }
        },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, role: true } },
          items: true
        }
      });
    }, TX_OPTIONS);
  }

  async confirm(id: string, confirmedById: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true }
      });
      if (!challan) throw new NotFoundError("Challan not found");
      if (challan.status !== "DRAFT") {
        throw new AppError(400, "BAD_REQUEST", "Only draft challans can be confirmed");
      }

      for (const item of challan.items) {
        await productService.applyStockDelta(tx, {
          productId: item.productId,
          quantity: item.quantity,
          movementType: "OUT",
          reason: `Sales challan ${challan.challanNumber} confirmed`,
          createdById: confirmedById
        });
      }

      return tx.challan.update({
        where: { id },
        data: { status: "CONFIRMED", confirmedAt: new Date() },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, role: true } },
          items: true
        }
      });
    }, TX_OPTIONS);
  }

  async cancel(id: string, cancelledById: string) {
    return prisma.$transaction(async (tx) => {
      const challan = await tx.challan.findUnique({
        where: { id },
        include: { items: true }
      });
      if (!challan) throw new NotFoundError("Challan not found");
      if (challan.status === "CANCELLED") {
        throw new AppError(400, "BAD_REQUEST", "Challan is already cancelled");
      }

      if (challan.status === "CONFIRMED") {
        for (const item of challan.items) {
          await productService.applyStockDelta(tx, {
            productId: item.productId,
            quantity: item.quantity,
            movementType: "IN",
            reason: `Sales challan ${challan.challanNumber} cancelled`,
            createdById: cancelledById
          });
        }
      }

      return tx.challan.update({
        where: { id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
        include: {
          customer: true,
          createdBy: { select: { id: true, name: true, role: true } },
          items: true
        }
      });
    }, TX_OPTIONS);
  }

  private mergeLineItems(items: CreateChallanInput["items"]) {
    const quantitiesByProductId = new Map<string, number>();
    for (const item of items) {
      quantitiesByProductId.set(
        item.productId,
        (quantitiesByProductId.get(item.productId) ?? 0) + item.quantity
      );
    }
    return Array.from(quantitiesByProductId.entries()).map(([productId, quantity]) => ({
      productId,
      quantity
    }));
  }

  private generateChallanNumber() {
    const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
    const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `CH-${stamp}-${suffix}`;
  }
}

export const challanService = new ChallanService();

