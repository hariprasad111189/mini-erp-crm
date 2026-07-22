# Mini ERP + CRM Operations Portal

Full-stack case-study project for Funds Room Infotech. This portal supports internal Admin, Sales, Warehouse, and Accounts teams with CRM, inventory, stock movement, sales challans, low-stock alerts, PDF challan download, and role-based access.

## Submission Details

| Requirement | Details |
|---|---|
| GitHub repository link | Add after pushing to GitHub |
| Live frontend URL | Add Vercel/Netlify/Render frontend URL after deployment |
| Live backend API URL | Add Render/Railway/Fly backend URL after deployment |
| Test login credentials | Listed below for all roles |
| Postman collection or API documentation | `postman/Mini-ERP-CRM.postman_collection.json` and `docs/API.md` |
| README with setup and deployment instructions | Included in this file |
| Short architecture explanation | Included below and expanded in `docs/ARCHITECTURE.md` |
| Known limitations or incomplete parts | Included below |

## Test Login Credentials

All seeded users use the password:

```text
password123
```

| Role | Email |
|---|---|
| Admin | `admin@fundsweb.local` |
| Sales | `sales@fundsweb.local` |
| Warehouse | `warehouse@fundsweb.local` |
| Accounts | `accounts@fundsweb.local` |

## Project Features

- JWT login with role-based access control.
- Admin/Sales customer CRM with live add and edit.
- Customer fields: customer name, business name, mobile, email, GST number, address, customer type, status, notes, and follow-up date.
- Warehouse/Admin product inventory with live create and edit.
- Inventory stock movement with mandatory product, quantity, and reason.
- Low-stock alert panel backed by the database query.
- Sales challan creation with mandatory customer, status, product, and quantity.
- Confirmed challans reduce stock safely and prevent negative stock.
- Challan line items store product snapshot data: product name, SKU, and price at the time of challan creation.
- Backend-rendered PDF challan download using `@react-pdf/renderer`.
- Consistent API error shape.
- Postman collection and API documentation.
- GitHub Actions CI workflow.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, shadcn-style UI components, Lucide icons |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT, bcrypt, RBAC middleware |
| Validation | Zod |
| PDF | `@react-pdf/renderer` |
| Testing | Vitest, Supertest |
| DevOps | GitHub Actions, optional Docker Compose local PostgreSQL |

## Project Structure

```text
Mini ERP + CRM Operations Portal/
├── .github/
│   └── workflows/
│       └── ci.yml
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   ├── scripts/
│   │   └── prove-concurrency.ts
│   ├── src/
│   │   ├── controllers/
│   │   ├── errors/
│   │   ├── lib/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── validators/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   ├── prisma.config.ts
│   ├── tsconfig.json
│   └── vitest.config.ts
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── .env.example
│   ├── components.json
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── vite.config.ts
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── postman/
│   └── Mini-ERP-CRM.postman_collection.json
├── docker-compose.yml
├── package.json
├── package-lock.json
└── README.md
```

## Database

This project uses PostgreSQL with Prisma.

Important:

- Do not commit real database passwords, connection strings, JWT secrets, or API keys.
- Real values must stay only in local `.env` files or hosting provider environment variables.
- `.env` files are ignored by Git.
- Only `.env.example` files are committed, and they contain placeholder/sample values.

Backend environment variables:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="8h"
PORT=4000
CORS_ORIGIN="http://localhost:5173"
```

Frontend environment variables:

```env
VITE_API_URL="http://localhost:4000/api"
```

## Local Setup

Install dependencies from the root folder:

```bash
npm install
```

Create environment files:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Update `backend/.env` with your PostgreSQL or Neon `DATABASE_URL`. Do not paste real keys into README, screenshots, or GitHub issues.

Optional local PostgreSQL using Docker:

```bash
docker compose up -d db
```

Run Prisma migration and seed:

```bash
cd backend
npx prisma migrate dev --name init
npm run prisma:seed
```

Start backend:

```bash
npm run dev
```

Start frontend in another terminal:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend health check: `http://localhost:4000/health`
- API base URL: `http://localhost:4000/api`

## Useful Commands

From the root folder:

```bash
npm run build
npm test
npm run dev:backend
npm run dev:frontend
```

Backend-only:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run proof:concurrency
```

## Architecture

The backend follows a Controller -> Service -> Repository structure.

- Controllers handle HTTP requests and responses.
- Validators check request bodies, params, and query strings with Zod.
- Services contain business logic such as authentication, stock movement, challan creation, and challan confirmation.
- Repositories isolate Prisma database queries.
- Middleware handles JWT authentication, role checks, validation, and global error handling.

The frontend is a React/Vite admin portal with protected routes, role-aware navigation, React Query server state, skeleton loaders, and live forms for customers, products, stock movement, and challans.

## Stock Safety Logic

Confirmed challans reduce product stock inside a Prisma transaction. Stock is decremented with a conditional update that only succeeds when enough stock exists.

```ts
tx.product.updateMany({
  where: {
    id: productId,
    currentStock: { gte: quantity }
  },
  data: {
    currentStock: { increment: -quantity }
  }
});
```

If the update count is not `1`, the API returns `INSUFFICIENT_STOCK` and the transaction rolls back. This prevents negative stock even during concurrent requests.

## Concurrency Proof

After the backend is running against a migrated and seeded database:

```bash
cd backend
npm run proof:concurrency
```

Expected result:

```text
Concurrency proof: 10 parallel confirmed challans against stock=1
Successes: 1
Clean stock rejections: 9
```

## API Documentation

API details are available in:

- `docs/API.md`
- `postman/Mini-ERP-CRM.postman_collection.json`

Main endpoints:

- `POST /api/auth/login`
- `GET /api/customers`
- `POST /api/customers`
- `PATCH /api/customers/:id`
- `GET /api/products`
- `POST /api/products`
- `PATCH /api/products/:id`
- `POST /api/products/:id/stock-movements`
- `GET /api/challans`
- `POST /api/challans`
- `POST /api/challans/:id/confirm`
- `POST /api/challans/:id/cancel`
- `GET /api/challans/:id/pdf`

## Deployment

Recommended free hosting:

- Frontend: Vercel, Netlify, or Render Static Site
- Backend: Render, Railway, or Fly.io
- Database: Neon, Supabase, or Render PostgreSQL

Backend deployment notes:

- Set root directory to `backend`.
- Build command: `npm install && npm run build && npx prisma migrate deploy`.
- Start command: `npm start`.
- Add environment variables in the hosting dashboard, not in GitHub.

Frontend deployment notes:

- Set root directory to `frontend`.
- Build command: `npm run build`.
- Output directory: `dist`.
- Set `VITE_API_URL` to the deployed backend API URL ending with `/api`.

More details are in `docs/DEPLOYMENT.md`.

## Known Limitations

- Live frontend and backend URLs must be added after deployment.
- AWS S3 product image upload is not implemented because it was listed as a bonus feature.
- The app includes the required workflow and operational UI; additional advanced reporting can be added later.

