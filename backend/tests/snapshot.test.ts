import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Prisma } from "@prisma/client";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";
import {
  SEED,
  auth,
  cleanupCustomer,
  cleanupProduct,
  createTestCustomer,
  createTestProduct,
  loginAs
} from "./helpers";

describe("challan item snapshots", () => {
  let adminToken: string;
  let salesToken: string;
  let customerId: string;
  let productId: string;

  beforeAll(async () => {
    adminToken = await loginAs(SEED.admin);
    salesToken = await loginAs(SEED.sales);
    const customer = await createTestCustomer(adminToken, `snap-${Date.now()}`);
    customerId = customer.id;
  });

  afterAll(async () => {
    if (productId) await cleanupProduct(productId);
    await cleanupCustomer(customerId);
  });

  it("snapshotPrice and snapshotName stay frozen after product updates", async () => {
    const product = await createTestProduct(adminToken, {
      name: "Snapshot Original Name",
      unitPrice: 150,
      currentStock: 20
    });
    productId = product.id;

    const created = await request(app)
      .post("/api/challans")
      .set(auth(salesToken))
      .send({
        customerId,
        status: "DRAFT",
        items: [{ productId: product.id, quantity: 2 }]
      });
    expect(created.status).toBe(201);

    const itemAtCreate = created.body.items[0];
    expect(itemAtCreate.snapshotName).toBe("Snapshot Original Name");
    expect(Number(itemAtCreate.snapshotPrice)).toBe(150);

    await prisma.product.update({
      where: { id: product.id },
      data: {
        name: "Mutated Product Name",
        unitPrice: new Prisma.Decimal("999.99")
      }
    });

    const refetched = await request(app)
      .get(`/api/challans/${created.body.id}`)
      .set(auth(salesToken));
    expect(refetched.status).toBe(200);

    const item = refetched.body.items[0];
    expect(item.snapshotName).toBe("Snapshot Original Name");
    expect(Number(item.snapshotPrice)).toBe(150);

    const liveProduct = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(liveProduct.name).toBe("Mutated Product Name");
    expect(liveProduct.unitPrice.toString()).toBe("999.99");
  });
});
