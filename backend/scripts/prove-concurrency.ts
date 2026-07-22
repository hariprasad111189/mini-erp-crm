const baseUrl = process.env.API_BASE_URL ?? "http://localhost:4000/api";
const email = process.env.PROOF_EMAIL ?? "sales@fundsweb.local";
const password = process.env.PROOF_PASSWORD ?? "password123";

const request = async <T>(path: string, init: RequestInit = {}, token?: string) => {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers
    }
  });
  const body = (await response.json().catch(() => ({}))) as T;
  return { ok: response.ok, status: response.status, body };
};

async function main() {
  const login = await request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
  if (!login.ok) throw new Error(`Login failed: ${JSON.stringify(login.body)}`);
  const token = login.body.token;

  const suffix = Date.now();
  const customer = await request<{ id: string }>(
    "/customers",
    {
      method: "POST",
      body: JSON.stringify({
        name: "Concurrency Proof Customer",
        mobile: `91${String(suffix).slice(-9)}`,
        email: `proof-${suffix}@example.test`,
        businessName: "Concurrency Proof Trading",
        customerType: "WHOLESALE",
        address: "Proof Lane, Test City",
        status: "ACTIVE",
        notes: "Created by concurrency proof script."
      })
    },
    token
  );
  if (!customer.ok) throw new Error(`Customer create failed: ${JSON.stringify(customer.body)}`);

  const product = await request<{ id: string }>(
    "/products",
    {
      method: "POST",
      body: JSON.stringify({
        name: "Concurrency Proof Product",
        sku: `PROOF-${suffix}`,
        category: "Proof",
        unitPrice: 100,
        currentStock: 1,
        minStockAlertQty: 1,
        location: "Proof Rack"
      })
    },
    token
  );
  if (!product.ok) throw new Error(`Product create failed: ${JSON.stringify(product.body)}`);

  const attempts = await Promise.all(
    Array.from({ length: 10 }, () =>
      request(
        "/challans",
        {
          method: "POST",
          body: JSON.stringify({
            customerId: customer.body.id,
            status: "CONFIRMED",
            items: [{ productId: product.body.id, quantity: 1 }]
          })
        },
        token
      )
    )
  );

  const successes = attempts.filter((attempt) => attempt.ok).length;
  const rejected = attempts.filter((attempt) => !attempt.ok && attempt.status === 409).length;

  console.log("Concurrency proof: 10 parallel confirmed challans against stock=1");
  console.log(`Successes: ${successes}`);
  console.log(`Clean stock rejections: ${rejected}`);
  console.table(
    attempts.map((attempt, index) => ({
      attempt: index + 1,
      status: attempt.status,
      code: (attempt.body as { error?: { code?: string } }).error?.code ?? "OK"
    }))
  );
}

void main().catch((error) => {
  console.error(error);
  process.exit(1);
});

