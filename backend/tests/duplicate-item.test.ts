import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "../src/app";
import {
  SEED,
  auth,
  cleanupCustomer,
  cleanupProduct,
  createTestCustomer,
  createTestProduct,
  loginAs
} from "./helpers";

describe("duplicate product line items", () => {
  let adminToken: string;
  let salesToken: string;
  let customerId: string;
  let productId: string;

  beforeAll(async () => {
    adminToken = await loginAs(SEED.admin);
    salesToken = await loginAs(SEED.sales);
    const customer = await createTestCustomer(adminToken, `dup-${Date.now()}`);
    customerId = customer.id;
    const product = await createTestProduct(adminToken, { currentStock: 10 });
    productId = product.id;
  });

  afterAll(async () => {
    await cleanupProduct(productId);
    await cleanupCustomer(customerId);
  });

  it("merges duplicate productId lines into one line with summed quantity", async () => {
    const response = await request(app)
      .post("/api/challans")
      .set(auth(salesToken))
      .send({
        customerId,
        status: "DRAFT",
        items: [
          { productId, quantity: 1 },
          { productId, quantity: 1 }
        ]
      });

    expect(response.status).toBe(201);
    expect(response.body.totalQty).toBe(2);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0]).toMatchObject({
      productId,
      quantity: 2
    });
  });
});
