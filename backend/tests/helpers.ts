import request from "supertest";
import { expect } from "vitest";
import app from "../src/app";
import { prisma } from "../src/lib/prisma";

export const SEED = {
  admin: "admin@fundsweb.local",
  sales: "sales@fundsweb.local",
  warehouse: "warehouse@fundsweb.local",
  password: "password123"
} as const;

export async function loginAs(email: string, password = SEED.password) {
  const response = await request(app).post("/api/auth/login").send({ email, password });
  expect(response.status).toBe(200);
  expect(response.body.token).toEqual(expect.any(String));
  return response.body.token as string;
}

export function auth(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function createTestCustomer(token: string, suffix = `${Date.now()}`) {
  const response = await request(app)
    .post("/api/customers")
    .set(auth(token))
    .send({
      name: `Test Customer ${suffix}`,
      mobile: `9${String(suffix).replace(/\D/g, "").padStart(9, "0").slice(-9)}`,
      email: `test-${suffix}@example.test`,
      businessName: `Test Biz ${suffix}`,
      customerType: "RETAIL",
      address: "100 Test Street, Test City",
      status: "ACTIVE"
    });
  expect(response.status).toBe(201);
  return response.body as { id: string };
}

export async function createTestProduct(
  token: string,
  overrides: Partial<{
    name: string;
    sku: string;
    unitPrice: number;
    currentStock: number;
  }> = {}
) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const response = await request(app)
    .post("/api/products")
    .set(auth(token))
    .send({
      name: overrides.name ?? `Test Product ${suffix}`,
      sku: overrides.sku ?? `TST-${suffix}`,
      category: "Test",
      unitPrice: overrides.unitPrice ?? 100,
      currentStock: overrides.currentStock ?? 10,
      minStockAlertQty: 1,
      location: "Test Rack"
    });
  expect(response.status).toBe(201);
  return response.body as {
    id: string;
    name: string;
    sku: string;
    unitPrice: string;
    currentStock: number;
  };
}

export async function cleanupProduct(productId: string) {
  await prisma.stockLog.deleteMany({ where: { productId } });
  await prisma.challanItem.deleteMany({ where: { productId } });
  await prisma.product.delete({ where: { id: productId } }).catch(() => undefined);
}

export async function cleanupCustomer(customerId: string) {
  const challans = await prisma.challan.findMany({
    where: { customerId },
    select: { id: true }
  });
  const challanIds = challans.map((c) => c.id);
  if (challanIds.length) {
    await prisma.challanItem.deleteMany({ where: { challanId: { in: challanIds } } });
    await prisma.challan.deleteMany({ where: { id: { in: challanIds } } });
  }
  await prisma.followUpNote.deleteMany({ where: { customerId } });
  await prisma.customer.delete({ where: { id: customerId } }).catch(() => undefined);
}
