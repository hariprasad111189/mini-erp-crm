import type { CustomerStatus, CustomerType, Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { getSkipTake, type Pagination } from "../utils/pagination";

type ListCustomersInput = Pagination & {
  search?: string;
  status?: CustomerStatus;
  customerType?: CustomerType;
};

export class CustomerRepository {
  constructor(private readonly db: PrismaClient = prisma) {}

  private where({ search, status, customerType }: ListCustomersInput): Prisma.CustomerWhereInput {
    return {
      status,
      customerType,
      OR: search
        ? [
            { name: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { businessName: { contains: search, mode: "insensitive" } }
          ]
        : undefined
    };
  }

  async list(input: ListCustomersInput) {
    const where = this.where(input);
    const [data, total] = await this.db.$transaction([
      this.db.customer.findMany({
        where,
        ...getSkipTake(input),
        orderBy: { updatedAt: "desc" }
      }),
      this.db.customer.count({ where })
    ]);
    return { data, total };
  }

  findById(id: string) {
    return this.db.customer.findUnique({
      where: { id },
      include: {
        followUpNotes: {
          include: { author: { select: { id: true, name: true, role: true } } },
          orderBy: { createdAt: "desc" }
        },
        challans: {
          select: {
            id: true,
            challanNumber: true,
            status: true,
            totalQty: true,
            totalAmount: true,
            createdAt: true
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });
  }

  create(data: Prisma.CustomerCreateInput) {
    return this.db.customer.create({ data });
  }

  update(id: string, data: Prisma.CustomerUpdateInput) {
    return this.db.customer.update({ where: { id }, data });
  }

  addFollowUp(customerId: string, authorId: string, note: string) {
    return this.db.followUpNote.create({
      data: { customerId, authorId, note },
      include: { author: { select: { id: true, name: true, role: true } } }
    });
  }
}

export const customerRepository = new CustomerRepository();

