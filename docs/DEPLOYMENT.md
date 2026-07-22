# Deployment

Suggested free deployment:

- Database: Neon PostgreSQL
- Backend: Render Web Service
- Frontend: Vercel

Local development can use the included `docker-compose.yml` PostgreSQL service. Copy `backend/.env.example` to `backend/.env`, then run `docker compose up -d db`.

## Backend on Render

1. Create a Neon PostgreSQL database and copy the connection string.
2. Create a Render Web Service from the GitHub repo.
3. Set root directory to `backend`.
4. Build command: `npm install && npm run build && npx prisma migrate deploy`
5. Start command: `npm start`
6. Environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `JWT_EXPIRES_IN`
   - `CORS_ORIGIN`

Run the seed once from a Render shell or locally against the production database:

```bash
npm run prisma:seed
```

## Frontend on Vercel

1. Import the GitHub repo into Vercel.
2. Set root directory to `frontend`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Set `VITE_API_URL` to the deployed backend API URL ending in `/api`.

## Smoke Test

1. Login with all four seeded roles.
2. Confirm that customers, products, low-stock alerts, and challans load.
3. Create a draft challan.
4. Create a confirmed challan and verify stock decreases.
5. Attempt an over-stock confirmed challan and verify `INSUFFICIENT_STOCK`.
6. Download a challan PDF.
