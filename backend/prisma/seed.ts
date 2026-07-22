import bcrypt from "bcrypt";
import { Prisma, PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  { name: "Admin User", email: "admin@fundsweb.local", role: Role.ADMIN },
  { name: "Sales User", email: "sales@fundsweb.local", role: Role.SALES },
  { name: "Warehouse User", email: "warehouse@fundsweb.local", role: Role.WAREHOUSE },
  { name: "Accounts User", email: "accounts@fundsweb.local", role: Role.ACCOUNTS }
];

const customers = [
  {
    name: "Ravi Kumar",
    mobile: "9000000001",
    email: "ravi@aaravtraders.test",
    businessName: "Aarav Traders",
    gstNumber: "29ABCDE1234F1Z5",
    customerType: "WHOLESALE" as const,
    address: "12 Market Road, Bengaluru",
    status: "ACTIVE" as const,
    followUpDate: new Date("2026-07-25"),
    notes: "High-volume buyer for electronics accessories."
  },
  {
    name: "Meera Shah",
    mobile: "9000000002",
    email: "meera@urbanmart.test",
    businessName: "Urban Mart",
    gstNumber: null,
    customerType: "RETAIL" as const,
    address: "45 Ring Road, Hyderabad",
    status: "LEAD" as const,
    followUpDate: new Date("2026-07-28"),
    notes: "Asked for first-order discount."
  },
  {
    name: "Prakash Reddy",
    mobile: "9000000003",
    email: "prakash@reddydistributors.test",
    businessName: "Reddy Distributors",
    gstNumber: "36ABCDE1234F1Z7",
    customerType: "DISTRIBUTOR" as const,
    address: "88 Industrial Area, Vijayawada",
    status: "ACTIVE" as const,
    followUpDate: null,
    notes: "Prefers monthly billing."
  },
  {
    name: "Fatima Khan",
    mobile: "9000000004",
    email: "fatima@northstar.test",
    businessName: "North Star Supplies",
    gstNumber: "27ABCDE1234F1Z3",
    customerType: "WHOLESALE" as const,
    address: "9 Station Road, Pune",
    status: "INACTIVE" as const,
    followUpDate: null,
    notes: "Paused purchases last quarter."
  },
  {
    name: "Arjun Nair",
    mobile: "9000000005",
    email: "arjun@coastline.test",
    businessName: "Coastline Retail",
    gstNumber: null,
    customerType: "RETAIL" as const,
    address: "21 Beach Road, Kochi",
    status: "LEAD" as const,
    followUpDate: new Date("2026-08-01"),
    notes: "Interested in seasonal inventory."
  }
];

const products = [
  ["Wireless Mouse", "WM-100", "Accessories", "649.00", 42, 10, "Bengaluru-A1"],
  ["Mechanical Keyboard", "MK-200", "Accessories", "2499.00", 9, 10, "Bengaluru-A2"],
  ["USB-C Hub", "UCH-300", "Electronics", "1299.00", 26, 8, "Hyderabad-H1"],
  ["Bluetooth Speaker", "BTS-400", "Audio", "1899.00", 4, 6, "Pune-P1"],
  ["Laptop Stand", "LS-500", "Office", "999.00", 31, 10, "Bengaluru-A3"],
  ["HDMI Cable", "HDMI-2M", "Cables", "249.00", 75, 25, "Hyderabad-H2"],
  ["Power Bank 10K", "PB-10K", "Electronics", "1499.00", 18, 12, "Kochi-K1"],
  ["LED Desk Lamp", "LDL-700", "Office", "1199.00", 11, 5, "Pune-P2"],
  ["Webcam HD", "WEB-HD", "Video", "2199.00", 7, 8, "Bengaluru-A4"],
  ["Noise Cancelling Headset", "NCH-900", "Audio", "3999.00", 15, 7, "Hyderabad-H3"]
] as const;

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { name: user.name, role: user.role, passwordHash },
      create: { ...user, passwordHash }
    });
  }

  const admin = await prisma.user.findUniqueOrThrow({ where: { email: "admin@fundsweb.local" } });

  for (const customer of customers) {
    await prisma.customer.upsert({
      where: { mobile: customer.mobile },
      update: customer,
      create: customer
    });
  }

  for (const [name, sku, category, unitPrice, currentStock, minStockAlertQty, location] of products) {
    await prisma.product.upsert({
      where: { sku },
      update: {
        name,
        category,
        unitPrice: new Prisma.Decimal(unitPrice),
        currentStock,
        minStockAlertQty,
        location
      },
      create: {
        name,
        sku,
        category,
        unitPrice: new Prisma.Decimal(unitPrice),
        currentStock,
        minStockAlertQty,
        location
      }
    });
  }

  const firstCustomer = await prisma.customer.findUniqueOrThrow({ where: { mobile: "9000000001" } });
  const existingNote = await prisma.followUpNote.findFirst({
    where: { customerId: firstCustomer.id, note: "Seed note: confirm next bulk order requirements." }
  });
  if (!existingNote) {
    await prisma.followUpNote.create({
      data: {
        customerId: firstCustomer.id,
        authorId: admin.id,
        note: "Seed note: confirm next bulk order requirements."
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

