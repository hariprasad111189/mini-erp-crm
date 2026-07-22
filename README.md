# Mini-ERP-CRM-Operations-Portal
The Mini ERP + CRM Operations Portal is a full-stack, role-based management app built with React, Node.js, TypeScript, and PostgreSQL. It streamlines Admin, Sales, Warehouse, and Accounts workflows with customer CRM, live inventory tracking, concurrency-safe sales challan processing to prevent negative stock, and dynamic PDF generation.

---

📦 Mini ERP + CRM Operations Portal

A full-stack, role-based management application supporting internal Admin, Sales, Warehouse, and Accounts operations with CRM, inventory tracking, concurrency-safe stock updates, and PDF challan generation.

---

🛠️ Tech Stack

🎨 Frontend

* Framework: React + Vite
* Language: TypeScript
* Styling: Tailwind CSS & shadcn/ui
* Icons: Lucide Icons

⚙️ Backend

* Runtime: Node.js + Express.js
* Language: TypeScript
* Database & ORM: PostgreSQL & Prisma ORM
* Auth & Validation: JWT, bcrypt, Zod
* PDF Generation: @react-pdf/renderer

---

✨ Key Features

* 🔒 Role-Based Auth: Secure JWT login for Admin, Sales, Warehouse, and Accounts roles.
* 👥 Customer CRM: Complete CRUD operations for customer profiles, contacts, GST, and follow-ups.
* 📊 Inventory Management: Real-time stock tracking with database-backed low-stock alerts.
* ⚡ Concurrency-Safe Stock Control: Atomic database transactions prevent negative inventory during high-traffic order confirmations.
* 📄 Sales Challans & PDFs: Multi-product challan creation with line-item price snapshots and instant backend PDF exports.

---

📁 Project Structure

<img width="662" height="337" alt="image" src="https://github.com/user-attachments/assets/6b249e78-66a0-45ba-b8d4-e7421d8ee267" />


## 🚀 Quick Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/hariprasad111189/Mini-ERP-CRM-Operations-Portal.git
cd mini-erp-crm

```

### 2️⃣ Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npx prisma migrate dev --name init
npm run prisma:seed
npm run dev

```

> 🌐 Backend runs on: `http://localhost:4000`

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev

```

> 🌐 Frontend runs on: `http://localhost:5173`

---

## 🔑 Test Credentials

> **Default Password for all roles:** `password123`

| 👤 Role | 📧 Email |
| --- | --- |
| **Admin** | `admin@fundsweb.local` |
| **Sales** | `sales@fundsweb.local` |
| **Warehouse** | `warehouse@fundsweb.local` |
| **Accounts** | `accounts@fundsweb.local` |

---

## 👤 Author

**Shyamala Hari Prasad**

```

```
