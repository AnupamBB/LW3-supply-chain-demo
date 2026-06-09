# Supply Chain Product Lifecycle Tracker

A supply chain management system with immutable event logging, cryptographic chain verification, and role-based access control.

## Features

- **Product Lifecycle Tracking**: Statuses: manufactured → shipped → received → sold → recycled
- **Immutable Event Logging**: Append-only event chains with SHA-256 verification
- **Chain Verification**: Cryptographic integrity validation
- **Role-Based Access**: Internal team vs partner permissions
- **Rate Limiting**: 1000 req/15min (internal) vs 100 req/15min (partners)
- **JWT Authentication**: Secure token-based auth

## Tech Stack

- **Backend**: Node.js, Express, MongoDB, Mongoose
- **Frontend**: React 19, Vite
- **Auth**: JWT, bcryptjs
- **Tools**: npm workspaces, concurrently

## Quick Start

### Prerequisites

- Node.js v16+
- MongoDB (local or remote)

### Setup

```bash
# Install dependencies
npm install

# Create .env file
cp sample.env .env
# Edit .env with your MongoDB URI and secret key

# Ensure MongoDB is running
mongod

# Start all services
npm run dev
```

Services will start on:

- Auth BFF: http://localhost:3001
- Products BFF: http://localhost:3002
- Dashboard: http://localhost:5173

### Seed Database

```bash
npm run seed
```

Creates 5 demo products, 7 demo users, and sample event chains.

## Demo Credentials

**Internal Users:**

- admin@supplychain.io / password123
- ops.manager@supplychain.io / password123
- logistics.lead@supplychain.io / password123

**Partner Users:**

- ops@alpha-logistics.com / password123
- tracking@beta-supply.co / password123
- warehouse@gamma-exports.in / password123
- admin@delta-distribution.com / password123

## Project Structure

```
supply-chain/
├── apps/                  # BFF services
│   ├── auth/             # Auth BFF
│   └── products/         # Products BFF
├── services/             # Services for DB connection
│   ├── auth/            # Auth service
│   └── products/        # Product management service
├── common/              # Shared utilities
│   ├── middleware/      # Auth, rate limiting
│   ├── utils/           # Hashing, demo data
│   └── config.js
├── static/
│   └── dashboard/       # React dashboard
└── scripts/
    └── seed.js          # Database seeding
```

## API Endpoints

### Authentication

```http
POST /login
Content-Type: application/json

{
  "email": "admin@supplychain.io",
  "password": "password123"
}
```

### Products

All endpoints require: `Authorization: Bearer <token>`

| Method | Endpoint               | Description                         |
| ------ | ---------------------- | ----------------------------------- |
| POST   | `/products`            | Create product                      |
| GET    | `/products`            | List products (pagination, filters) |
| GET    | `/products/:id`        | Get product with events             |
| POST   | `/products/:id/events` | Add event to product                |
| GET    | `/products/:id/verify` | Verify chain integrity              |

### Example: Add Event

```http
POST /products/:id/events
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "shipped",
  "payload": {
    "note": "Shipped from warehouse",
    "location": "warehouse-01"
  }
}
```

## Database Schema

### Products

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  partnerId: String,
  status: String,  // manufactured, shipped, received, sold, recycled
  createdAt: Date,
  updatedAt: Date
}
```

### Events

```javascript
{
  _id: ObjectId,
  productId: ObjectId,
  type: String,
  payload: Object,
  sequence: Number,
  previousEventId: ObjectId,
  previousHash: String,
  hash: String,  // SHA-256
  createdAt: Date
}
```

## Common Issues

| Issue                     | Solution                                                               |
| ------------------------- | ---------------------------------------------------------------------- |
| MongoDB connection failed | Ensure MongoDB is running on localhost:27017                           |
| Port already in use       | Change ports in .env or kill process: `lsof -ti:3001 \| xargs kill -9` |
| Invalid token             | Tokens expire after 1 day; login again                                 |
| Rate limit exceeded       | Wait 15 minutes or use internal user account                           |

## Development Commands

```bash
npm run auth              # Start auth BFF only
npm run auth-service      # Start auth microservice only
npm run products-bff      # Start products BFF only
npm run products-service  # Start products service only
npm run dashboard         # Start React dashboard only
npm run dev              # Start all services concurrently
npm run seed             # Seed database with demo data
```

## Key Features Explained

### Event Chain Verification

- Each event is hashed with SHA-256
- Each event references the previous event's hash
- The system validates the entire chain is unbroken
- Prevents tampering and ensures data integrity

### Role-Based Access

- **Internal**: Full access, can add events, verify chains
- **Partner**: View only their own products and events

### Rate Limiting

- Middleware in `common/middleware/rateLimiter.js`
- Headers: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`
- Can be customized per role

## Production Checklist

- [ ] Change `JWT_SECRET` to a strong random value
- [ ] Use production MongoDB connection string
- [ ] Enable HTTPS/TLS
- [ ] Set `NODE_ENV=production`
- [ ] Configure CORS if needed
- [ ] Set up monitoring and logging
- [ ] Enable database backups

## License

Private project. All rights reserved.
