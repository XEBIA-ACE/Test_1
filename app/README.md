# Product Service

A production-ready **Product Catalog Service** built with Node.js, TypeScript, and Express following **Hexagonal Architecture** (Ports & Adapters).

## Overview

The Product Service manages the full product catalog lifecycle:

- **Write Model**: PostgreSQL 15+ (via PgBouncer) for CRUD operations
- **Read Model**: Elasticsearch 8+ for full-text search and category browsing
- **Cache Layer**: Redis 7+ with cache-aside pattern for product listings
- **Event Bus**: Apache Kafka for `CatalogUpdated` event publishing and consumption
- **Circuit Breaker**: opossum for Elasticsearch resilience with Redis fallback

## Architecture

```
src/
├── domain/              # Core business logic (entities, value objects, events)
├── ports/               # Interfaces (inbound & outbound)
├── application/         # Use-case services and DTOs
├── adapters/
│   ├── inbound/         # HTTP controllers, Kafka consumer
│   └── outbound/        # PostgreSQL, Elasticsearch, Redis, Kafka adapters
└── infrastructure/      # Config, observability, circuit breaker
```

## Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Elasticsearch 8+
- Redis 7+
- Apache Kafka 3+

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your local values
```

### 3. Run in development

```bash
npm run dev
```

### 4. Build for production

```bash
npm run build
npm start
```

### 5. Run tests

```bash
npm test
npm run test:coverage
```

## Docker

```bash
# Build image
docker build -t product-service:latest .

# Run container
docker run -p 3000:3000 --env-file .env product-service:latest
```

## API Endpoints

### Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Liveness check |
| GET | `/health/ready` | Readiness check |

### Products (Admin — requires `admin` role in JWT)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/products` | Create product |
| GET | `/api/v1/products/:id` | Get product by ID |
| PUT | `/api/v1/products/:id` | Update product |
| DELETE | `/api/v1/products/:id` | Delete product |

### Search & Browse
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/search?q=&page=&size=` | Full-text search |
| GET | `/api/v1/search/category/:slug` | Browse by category |

## Observability

- **Metrics**: Prometheus endpoint at `:9090/metrics`
- **Tracing**: OpenTelemetry OTLP export
- **Logging**: Structured JSON via Winston

## Environment Variables

See [.env.example](.env.example) for all configuration options.

## Kubernetes

Manifests are in the `k8s/` directory:

```bash
kubectl apply -f k8s/
```
