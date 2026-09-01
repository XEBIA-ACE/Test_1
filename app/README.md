# Identity & Auth Service

A production-grade **Identity and Authentication** microservice built with **Node.js**, **Fastify**, and **TypeScript**, following **Hexagonal Architecture** (Ports & Adapters).

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Database Migrations](#database-migrations)
- [Testing](#testing)
- [Observability](#observability)
- [Security](#security)

---

## Overview

The Identity & Auth Service is responsible for:

| Capability | Details |
|---|---|
| User Registration | Email & Mobile strategies (Strategy Pattern) |
| Password Security | Argon2id (cost ≥ 12), never stored in plaintext |
| JWT Tokens | RS256, 15-min access tokens + rotating refresh tokens |
| OTP Verification | Redis-backed, 5-min TTL, mobile registration |
| Account Lockout | Configurable N-attempt lockout via Redis counters |
| OAuth2 / OIDC | Google & Facebook social login |
| Domain Events | UserRegistered, OTPRequested, AccountDeactivated via Transactional Outbox → Kafka |
| CQRS | Command handlers write to PostgreSQL; query handlers use Redis cache-aside |
| Token Revocation | Redis blacklist on logout |
| Secrets Management | HashiCorp Vault for JWT keys & DB credentials |
| Observability | OpenTelemetry (traces, metrics, structured logs) |

---

## Architecture

```
src/
├── domain/                        # Core business logic — no framework dependencies
│   ├── entities/                  # User, RefreshToken, OutboxEvent
│   ├── value-objects/             # Email, PhoneNumber, Password
│   ├── ports/
│   │   ├── inbound/               # IAuthCommandPort, IAuthQueryPort
│   │   └── outbound/              # IUserRepository, ICachePort, IEventPublisher, …
│   ├── services/                  # PasswordService, TokenService, OtpService
│   └── strategies/                # EmailRegistrationStrategy, MobileRegistrationStrategy
│
├── application/                   # Use-case orchestration (CQRS)
│   ├── commands/                  # RegisterUser, Login, RefreshToken, Logout, VerifyOtp
│   ├── handlers/                  # Command handlers
│   └── queries/                   # ValidateToken + handler
│
└── infrastructure/                # Adapters (framework, DB, cache, messaging, …)
    ├── adapters/
    │   ├── inbound/http/          # Fastify routes, controllers, JSON schemas
    │   └── outbound/
    │       ├── persistence/       # PostgreSQL repositories (pg)
    │       ├── cache/             # Redis adapter (ioredis)
    │       ├── messaging/         # Kafka Outbox Relay (kafkajs)
    │       ├── vault/             # HashiCorp Vault adapter
    │       └── oauth/             # OAuth2 / OIDC adapter
    ├── db/
    │   ├── client.ts              # pg Pool factory
    │   └── migrations/            # Flyway SQL migrations
    └── observability/             # OpenTelemetry tracing & metrics setup
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Framework | Fastify 4 |
| Language | TypeScript 5 |
| Auth | Passport.js strategies, JWT RS256 (jsonwebtoken) |
| Password Hashing | Argon2id |
| Database | PostgreSQL 15 + PgBouncer |
| Cache / Blacklist | Redis 7.x (ioredis) |
| Messaging | Apache Kafka (kafkajs) |
| Migrations | Flyway |
| Secrets | HashiCorp Vault |
| Service Mesh | Istio mTLS |
| Observability | OpenTelemetry SDK |
| Containerisation | Docker + Kubernetes |

---

## Getting Started

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- PostgreSQL 15
- Redis 7
- Kafka (optional for local dev)

### Local Development

```bash
# 1. Clone and install
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your local values

# 3. Generate RS256 key pair (development only)
mkdir -p keys
openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem

# 4. Run database migrations
npm run migrate

# 5. Start in development mode (hot-reload)
npm run dev
```

### Docker

```bash
docker build -t identity-auth-service:latest .
docker run -p 3000:3000 --env-file .env identity-auth-service:latest
```

---

## Environment Variables

See [.env.example](.env.example) for the full list with descriptions.

Key variables:

| Variable | Description |
|---|---|
| `PORT` | HTTP server port (default: 3000) |
| `DB_HOST` | PostgreSQL host |
| `REDIS_HOST` | Redis host |
| `VAULT_ADDR` | HashiCorp Vault address |
| `VAULT_ENABLED` | Enable Vault secret loading (`true`/`false`) |
| `JWT_ACCESS_TOKEN_EXPIRY` | Access token TTL in seconds (default: 900) |
| `KAFKA_BROKERS` | Comma-separated Kafka broker list |
| `OTEL_ENABLED` | Enable OpenTelemetry export |

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register with email or mobile |
| `POST` | `/auth/login` | Login, receive token pair |
| `POST` | `/auth/refresh` | Rotate refresh token |
| `POST` | `/auth/logout` | Revoke tokens |
| `POST` | `/auth/otp/verify` | Verify OTP code |
| `GET` | `/auth/oauth/google` | Initiate Google OAuth2 flow |
| `GET` | `/auth/oauth/google/callback` | Google OAuth2 callback |
| `GET` | `/auth/oauth/facebook` | Initiate Facebook OAuth2 flow |
| `GET` | `/auth/oauth/facebook/callback` | Facebook OAuth2 callback |
| `GET` | `/health` | Liveness probe |
| `GET` | `/ready` | Readiness probe |

Swagger UI is available at `/docs` when `NODE_ENV=development`.

---

## Database Migrations

Migrations are managed by **Flyway** and located in `src/infrastructure/db/migrations/`.

```bash
# Run all pending migrations
npm run migrate
```

Migration files follow the naming convention: `V{version}__{description}.sql`

---

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage
```

Tests are located in the `tests/` directory and use **Jest** + **ts-jest**.

---

## Observability

When `OTEL_ENABLED=true`, the service exports:

- **Traces** — distributed tracing via OTLP gRPC to `OTEL_EXPORTER_OTLP_ENDPOINT`
- **Metrics** — HTTP request counts, latencies, DB pool stats
- **Logs** — structured JSON via Pino, correlated with trace IDs

---

## Security

- Passwords hashed with **Argon2id** (memory cost ≥ 65536, time cost ≥ 3, parallelism ≥ 4)
- JWT signed with **RS256** — private key stored in HashiCorp Vault
- Refresh tokens are **rotated** on every use (old token invalidated immediately)
- Tokens are **blacklisted** in Redis on logout
- Account **lockout** after configurable failed attempts (default: 5)
- All inter-service communication secured via **Istio mTLS**
- Helmet + CORS headers on all HTTP responses
- Rate limiting on auth endpoints
