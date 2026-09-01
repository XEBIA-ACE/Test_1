# AGENTS.md

## Stack

- **Service:** Auth Service
- **Type:** business
- **Technologies:**
- Node.js (Express/Fastify) or Java Spring Boot
- PostgreSQL 15+ with PgBouncer (user accounts, credentials, outbox table)
- Redis 7+ (refresh token store, OTP TTL management)
- JWT RS256 (access token signing and validation)
- Bcrypt / Argon2 (password hashing)
- Apache Kafka / RabbitMQ (UserRegistered event publishing via Outbox relay)
- TypeORM / Hibernate / Prisma (ORM for PostgreSQL)
- HashiCorp Vault / AWS Secrets Manager (JWT key pairs, DB and Redis credentials)
- Docker + Kubernetes (containerization and orchestration)
- Prometheus + OpenTelemetry (metrics and distributed tracing)
- **Responsibilities:**
- Accept and validate user registration requests for both email-based and mobile-number-based flows
- Hash and securely store user passwords using Bcrypt or Argon2 with per-user salts
- Issue short-lived JWT access tokens (RS256 signed, 15-minute TTL) upon successful authentication
- Manage refresh token issuance, rotation on each use, and revocation stored in Redis with TTL
- Generate and validate time-limited OTP codes for mobile number verification
- Publish UserRegistered domain events to the message broker using the Outbox Pattern for guaranteed at-least-once delivery
- Expose authenticated user profile read endpoint (GET /auth/me)
- Expose a JWKS endpoint for RS256 public key distribution to the API Gateway and downstream validators
- Enforce input validation and sanitization to prevent injection attacks
- Support refresh token family tracking to detect and respond to token reuse attacks

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
