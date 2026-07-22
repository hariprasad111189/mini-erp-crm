import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
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

describe("challan stock movements", () => {
  let adminToken: string;
  let salesToken: string;
  let customerId: string;
  const productIds: string[] = [];

  beforeAll(async () => {
    adminToken = await loginAs(SEED.admin);
    salesToken = await loginAs(SEED.sales);
    const customer = await createTestCustomer(adminToken, `challan-${Date.now()}`);
    customerId = customer.id;
  });

  afterAll(async () => {
    for (const id of productIds) await cleanupProduct(id);
    await cleanupCustomer(customerId);
  });

  it("confirming a challan with sufficient stock decreases currentStock and creates StockLog OUT", async () => {
    const product = await createTestProduct(adminToken, { currentStock: 10, unitPrice: 200 });
    productIds.push(product.id);
    const qty = 3;

    const draft = await request(app)
      .post("/api/challans")
      .set(auth(salesToken))
      .send({
        customerId,
        status: "DRAFT",
        items: [{ productId: product.id, quantity: qty }]
      });
    expect(draft.status).toBe(201);

    const confirmed = await request(app)
      .post(`/api/challans/${draft.body.id}/confirm`)
      .set(auth(salesToken));
    expect(confirmed.status).toBe(200);
    expect(confirmed.body.status).toBe("CONFIRMED");

    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.currentStock).toBe(10 - qty);

    const log = await prisma.stockLog.findFirst({
      where: { productId: product.id, movementType: "OUT" },
      orderBy: { createdAt: "desc" }
    });
    expect(log).toMatchObject({
      productId: product.id,
      movementType: "OUT",
      quantityChanged: -qty
    });
  });

  it("confirming with quantity > currentStock returns 409 and leaves stock unchanged", async () => {
    const product = await createTestProduct(adminToken, { currentStock: 2 });
    productIds.push(product.id);
    const stockBefore = 2;

    const draft = await request(app)
      .post("/api/challans")
      .set(auth(salesToken))
      .send({
        customerId,
        status: "DRAFT",
        items: [{ productId: product.id, quantity: 5 }]
      });
    expect(draft.status).toBe(201);

    const confirmed = await request(app)
      .post(`/api/challans/${draft.body.id}/confirm`)
      .set(auth(salesToken));
    expect(confirmed.status).toBe(409);
    expect(confirmed.body.error.code).toBe("INSUFFICIENT_STOCK");
    expect(confirmed.body.error.message).toContain(product.id);
    expect(confirmed.body.error.message).toContain("5");

    const updated = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(updated.currentStock).toBe(stockBefore);

    const challan = await prisma.challan.findUniqueOrThrow({ where: { id: draft.body.id } });
    expect(challan.status).toBe("DRAFT");
  });

  it("cancelling a CONFIRMED challan restores currentStock and creates StockLog IN", async () => {
    const product = await createTestProduct(adminToken, { currentStock: 8 });
    productIds.push(product.id);
    const qty = 4;

    const created = await request(app)
      .post("/api/challans")
      .set(auth(salesToken))
      .send({
        customerId,
        status: "CONFIRMED",
        items: [{ productId: product.id, quantity: qty }]
      });
    expect(created.status).toBe(201);
    expect(created.body.status).toBe("CONFIRMED");

    const afterConfirm = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(afterConfirm.currentStock).toBe(8 - qty);

    const cancelled = await request(app)
      .post(`/api/challans/${created.body.id}/cancel`)
      .set(auth(salesToken));
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.status).toBe("CANCELLED");

    const afterCancel = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    expect(afterCancel.currentStock).toBe(8);

    const inLog = await prisma.stockLog.findFirst({
      where: { productId: product.id, movementType: "IN" },
      orderBy: { createdAt: "desc" }
    });
    expect(inLog).toMatchObject({
      productId: product.id,
      movementType: "IN",
      quantityChanged: qty
    });
  });
});
