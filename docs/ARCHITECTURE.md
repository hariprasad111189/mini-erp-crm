# Architecture

The backend follows a Controller -> Service -> Repository pattern.

- Controllers translate HTTP input/output.
- Validators use Zod before controllers run.
- Services own business rules such as RBAC-sensitive operations, challan totals, snapshots, and stock movement logic.
- Repositories isolate Prisma query details for list/detail operations.
- Middleware handles JWT auth, RBAC checks, validation, and consistent error responses.

## Transaction Design

Stock movement is centralized in `ProductService.applyStockDelta`. OUT movements use a conditional database update with `currentStock >= quantity`, then create a `StockLog` in the same transaction. Confirmed challans call this helper for each line item inside `prisma.$transaction`, so any insufficient stock rejection rolls back all challan and stock-log writes.

## Snapshot Design

`ChallanItem` stores `snapshotName`, `snapshotSku`, and `snapshotPrice`. This keeps invoice history stable even if products are renamed, re-SKUed, or repriced later.

## Frontend Design

The React app uses protected routes, a role-aware app shell, React Query for server state, fixed-height skeleton loaders, and compact admin-style tables. The low-stock panel is backed by `GET /products/low-stock`, not a frontend-only badge.

