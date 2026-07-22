# API Reference

Base URL: `/api`

Authentication uses `Authorization: Bearer <token>`.

## Auth

### `POST /auth/login`

Body:

```json
{
  "email": "admin@fundsweb.local",
  "password": "password123"
}
```

Returns a JWT and the current user.

## Customers

- `GET /customers?page=1&pageSize=20&search=&status=&customerType=`
- `POST /customers`
- `GET /customers/:id`
- `PATCH /customers/:id`
- `POST /customers/:id/follow-ups`

Create body:

```json
{
  "name": "Ravi Kumar",
  "mobile": "9000000001",
  "email": "ravi@example.com",
  "businessName": "Aarav Traders",
  "gstNumber": "29ABCDE1234F1Z5",
  "customerType": "WHOLESALE",
  "address": "12 Market Road, Bengaluru",
  "status": "ACTIVE",
  "followUpDate": "2026-07-25",
  "notes": "High-volume buyer."
}
```

## Products

- `GET /products?page=1&pageSize=20&search=&category=`
- `GET /products/low-stock`
- `POST /products`
- `GET /products/:id`
- `PATCH /products/:id`
- `POST /products/:id/stock-movements`

Stock movement body:

```json
{
  "quantity": 5,
  "movementType": "OUT",
  "reason": "Damaged inventory adjustment"
}
```

## Challans

- `GET /challans?page=1&pageSize=20&search=&status=&customerId=`
- `POST /challans`
- `GET /challans/:id`
- `GET /challans/:id/pdf`
- `POST /challans/:id/confirm`
- `POST /challans/:id/cancel`

Create body:

```json
{
  "customerId": "uuid",
  "status": "CONFIRMED",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2
    }
  ]
}
```

Errors always use:

```json
{
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for requested product quantity"
  }
}
```

