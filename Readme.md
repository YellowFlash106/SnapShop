# SnapShop

SnapShop is a Node.js + Express backend for an e-commerce application. It exposes REST APIs for authentication, product browsing, carts, checkout, reviews, wishlists, addresses, and admin operations. The data layer is powered by Prisma with PostgreSQL.

## What this project includes

- User registration, login, and logout with JWT-based authentication
- Cookie or Bearer-token auth support
- Product catalog, search, wishlist, and product reviews
- Cart and order management with order history, tracking, invoice, and reorder support
- Address management for customer profiles
- Admin endpoints for dashboard, analytics, inventory, review moderation, and logs
- Prisma migrations and schema for PostgreSQL
- Security middleware for rate limiting, CORS, helmet, compression, and HPP protection

## Tech Stack

- Node.js
- Express 5
- Prisma
- PostgreSQL
- JWT
- Zod
- Multer
- PDFKit
- bcryptjs

## Project Structure

```text
backend/
  prisma/
		schema.prisma
		migrations/
  src/
		server.js
		config/
		controllers/
		adminControllers/
		middleware/
		routes/
		adminRoutes/
		services/
		utils/
		validators/
```

## Requirements

- Node.js 18+ recommended
- PostgreSQL database
- npm

## Setup

1. Install dependencies.

	```bash
	cd backend
	npm install
	```

2. Create a `.env` file in `backend/`.

3. Set up the database schema.

	```bash
	npx prisma generate
	npx prisma migrate dev
	```

4. Start the development server.

	```bash
	npm run dev
	```

5. For production.

	```bash
	npm start
	```

## Environment Variables

The backend reads these values from `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string for Prisma |
| `PORT` | Server port, defaults to `5000` |
| `CLIENT_URL` | Allowed browser origin for CORS |
| `NODE_ENV` | Used to decide whether auth cookies are secure |
| `JWT_SECRET` | Secret for auth token verification |
| `ACCESS_TOKEN_SECRET` | Secret used by token service for access tokens |
| `REFRESH_TOKEN_SECRET` | Secret used by token service for refresh tokens |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token lifetime |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime |

Example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/snapshop"
PORT=5000
CLIENT_URL="http://localhost:3000"
NODE_ENV=development
JWT_SECRET="replace-with-a-long-random-secret"
ACCESS_TOKEN_SECRET="replace-with-a-long-random-secret"
REFRESH_TOKEN_SECRET="replace-with-a-long-random-secret"
ACCESS_TOKEN_EXPIRES_IN="15m"
REFRESH_TOKEN_EXPIRES_IN="7d"
```

## Scripts

Run these from the `backend/` directory:

- `npm run dev` - start the server with nodemon
- `npm start` - start the server with Node.js

## Database Model

Core Prisma models include:

- `User`
- `Product`
- `Category`
- `Cart` and `CartItem`
- `Order`, `OrderItem`, and `OrderHistory`
- `Review`
- `Wishlist`
- `Address`

The schema also includes `Role` and `OrderStatus` enums.

## API Overview

All routes are mounted under `/api`.

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`

### Products

- `POST /api/products/create`
- `GET /api/products`
- `GET /api/products/all`
- `GET /api/products/search`
- `GET /api/products/:id`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`
- `GET /api/products/:id/reviews`
- `POST /api/products/:id/reviews`
- `GET /api/products/wishlist`
- `POST /api/products/:productId/wishlist`
- `DELETE /api/products/wishlist/:productId`

### Cart

- `POST /api/cart/add`
- `GET /api/cart`
- `PATCH /api/cart/items/:productId`
- `DELETE /api/cart/clear`
- `DELETE /api/cart/items/:productId`

### Orders

- `POST /api/orders`
- `GET /api/orders/user/:userId`
- `GET /api/orders/:id`
- `PUT /api/orders/:id/cancel`
- `GET /api/orders/:id/history`
- `PATCH /api/orders/:id/status`
- `GET /api/orders/:id/tracking`
- `PATCH /api/orders/:id/confirm`
- `GET /api/orders/:id/summary`
- `POST /api/orders/:id/reorder`
- `GET /api/orders/:id/invoice`

### Reviews

- `POST /api/reviews`
- `PUT /api/reviews/:id`
- `DELETE /api/reviews/:id`
- `GET /api/reviews/product/:productId`

### Addresses

- `POST /api/address`
- `GET /api/address`
- `GET /api/address/:id`
- `PUT /api/address/:id`
- `DELETE /api/address/:id`

### Admin

- `GET /api/admin/dashboard`
- `GET /api/admin/analytics`
- `GET /api/admin/inventory/analytics`
- `GET /api/admin/logs`
- `GET /api/admin/reviews`
- `PUT /api/admin/reviews/:id/approve`
- `PUT /api/admin/reviews/:id/hide`
- `DELETE /api/admin/reviews/:id`

## Authentication Notes

- The auth middleware accepts either a Bearer token or the `token` cookie.
- CORS is configured with credentials enabled.
- Rate limiting is enabled globally and for auth routes.

## Health Check

The root route responds with a simple JSON message:

```http
GET /
```

## Notes

- Prisma migrations are already committed under `backend/prisma/migrations`.
- Wishlist and review records are unique per user/product pair.
- If Prisma schema changes are made, regenerate the client and create a new migration.
