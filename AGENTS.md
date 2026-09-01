# AGENTS.md

## Stack

- **Service:** Identity & Auth Service
- **Type:** business
- **Technologies:**
- Node.js with Fastify OR Java Spring Boot
- Passport.js (Node) OR Spring Security (Java)
- Argon2id / bcrypt for password hashing
- JWT RS256 (jsonwebtoken / nimbus-jose-jwt)
- OAuth2 / OpenID Connect
- PostgreSQL 15 (Auth DB — owned exclusively)
- PgBouncer (connection pooling)
- Redis 7.x (OTP cache, token blacklist, lockout counters)
- Apache Kafka (event producer via Transactional Outbox)
- Debezium CDC OR polling relay for Outbox-to-Kafka relay
- HashiCorp Vault (JWT signing keys, DB credentials)
- Istio mTLS (inter-service communication)
- Docker + Kubernetes
- OpenTelemetry SDK (metrics, traces, logs)
- Flyway / Liquibase (DB schema migrations)
- **Responsibilities:**
- Accept and validate user registration requests via email or mobile number (Strategy Pattern: EmailRegistrationStrategy, MobileRegistrationStrategy)
- Hash passwords using Argon2id (cost >= 12) or bcrypt before storage; never store plaintext credentials
- Issue short-lived JWT access tokens (RS256, 15-min expiry) and long-lived refresh tokens
- Implement refresh token rotation: invalidate old token on each refresh, issue new token pair
- Generate and verify OTP codes for mobile-based registration; store OTP in Redis with 5-min TTL
- Enforce account lockout after N consecutive failed login attempts; auto-reset via Redis TTL
- Support OAuth2 + OpenID Connect flows for third-party social login (Google, Facebook)
- Publish UserRegistered, OTPRequested, and AccountDeactivated domain events to Kafka via Transactional Outbox Pattern
- Implement CQRS: command handlers write to Auth DB; query handlers validate tokens via Redis cache-aside then DB fallback
- Revoke tokens on logout by adding to Redis blacklist with TTL matching token expiry
- Retrieve JWT signing keys and DB credentials from HashiCorp Vault at startup and on rotation
- Expose health check endpoints (/health, /ready) for Kubernetes liveness and readiness probes
- Emit structured logs, metrics, and distributed traces via OpenTelemetry to the Observability Stack

## General Rules

- Always read files in /specs before implementing
- Never implement without acceptance criteria
- Code should be simple and readable
- Avoid overengineering
- The project follows a hexagonal architecture

## Required Workflow

1. Read the specs in the /specs directory
2. Generate tasks.md if it does not exist
3. Implement based on the tasks
4. Create automated tests
5. Validate acceptance criteria

## Testing

- Cover all acceptance criteria
- Tests should be clear and straightforward
- Generated code must reach **90% unit test coverage**

## Constraints

- Do not invent requirements that are not described
- Do not change behavior without updating the spec
