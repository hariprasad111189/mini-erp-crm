import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import app from "../src/app";
import {
  SEED,
  auth,
  cleanupCustomer,
  cleanupProduct,
  loginAs
} from "./helpers";

describe("rbac", () => {
  const createdCustomerIds: string[] = [];
  const createdProductIds: string[] = [];

  afterAll(async () => {
    for (const id of createdProductIds) await cleanupProduct(id);
    for (const id of createdCustomerIds) await cleanupCustomer(id);
  });

  it("WAREHOUSE role gets 403 on POST /customers", async () => {
    const token = await loginAs(SEED.warehouse);
    const response = await request(app)
      .post("/api/customers")
      .set(auth(token))
      .send({
        name: "Warehouse Blocked",
        mobile: "9111111111",
        email: "wh-blocked@example.test",
        businessName: "Blocked Co",
        customerType: "RETAIL",
        address: "Blocked Address Lane",
        status: "LEAD"
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("SALES role gets 403 on POST /products", async () => {
    const token = await loginAs(SEED.sales);
    const response = await request(app)
      .post("/api/products")
      .set(auth(token))
      .send({
        name: "Sales Blocked Product",
        sku: `SALES-BLOCK-${Date.now()}`,
        category: "Test",
        unitPrice: 10,
        currentStock: 1,
        minStockAlertQty: 0,
        location: "N/A"
      });

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("FORBIDDEN");
  });

  it("ADMIN succeeds on POST /customers and POST /products", async () => {
    const token = await loginAs(SEED.admin);
    const suffix = `${Date.now()}`;

    const customer = await request(app)
      .post("/api/customers")
      .set(auth(token))
      .send({
        name: `Admin Customer ${suffix}`,
        mobile: `92${String(suffix).slice(-8)}`,
        email: `admin-ok-${suffix}@example.test`,
        businessName: `Admin Biz ${suffix}`,
        customerType: "WHOLESALE",
        address: "Admin Success Address",
        status: "ACTIVE"
      });
    expect(customer.status).toBe(201);
    createdCustomerIds.push(customer.body.id);

    const product = await request(app)
      .post("/api/products")
      .set(auth(token))
      .send({
        name: `Admin Product ${suffix}`,
        sku: `ADM-${suffix}`,
        category: "Test",
        unitPrice: 50,
        currentStock: 5,
        minStockAlertQty: 1,
        location: "Admin Rack"
      });
    expect(product.status).toBe(201);
    createdProductIds.push(product.body.id);
  });
});
