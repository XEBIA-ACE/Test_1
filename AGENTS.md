# AGENTS.md

## Stack

- **Service:** Product Service
- **Type:** business
- **Technologies:**
- Node.js (Express/Fastify) or Java Spring Boot
- PostgreSQL 15+ with PgBouncer (product catalog write model, COMP-005b)
- Elasticsearch 8+ (product search index, read model, COMP-007)
- Redis 7+ (product listing cache, cache-aside pattern, COMP-006)
- Apache Kafka / RabbitMQ (CatalogUpdated event publishing and consumption, COMP-008)
- TypeORM / Hibernate / Prisma (ORM for PostgreSQL)
- Elasticsearch REST client / official SDK
- Resilience4j / opossum (circuit breaker for Elasticsearch)
- HashiCorp Vault / AWS Secrets Manager (DB, Elasticsearch, Redis credentials)
- Docker + Kubernetes (containerization and orchestration)
- Prometheus + OpenTelemetry (metrics and distributed tracing)
- **Responsibilities:**
- Manage product catalog CRUD operations (admin/internal write model backed by PostgreSQL)
- Synchronize product data from PostgreSQL write model to Elasticsearch read model via CatalogUpdated events (Kafka consumer)
- Execute full-text keyword search queries against Elasticsearch with BM25 relevance ranking and pagination
- Support category-based product browsing with filtering by price range, rating, and stock status
- Return product listing metadata: name, price, customer rating, stock status, category, and thumbnail URL
- Serve product detail views for individual product pages
- Implement cache-aside pattern using Redis for frequently accessed product listings and category results
- Invalidate Redis cache entries on product data updates (CatalogUpdated events)
- Implement circuit breaker for Elasticsearch calls with Redis cache fallback for graceful degradation
- Enforce RBAC on admin write endpoints (role validation delegated to API Gateway JWT claims)

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
