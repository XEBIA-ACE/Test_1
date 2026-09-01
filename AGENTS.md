# AGENTS.md

## Stack

- **Service:** Notification Service
- **Type:** integration
- **Technologies:**
- Node.js (Express/Fastify) or Python (FastAPI/Celery)
- Apache Kafka / RabbitMQ consumer client
- SendGrid SDK / AWS SES SDK (email delivery)
- Twilio SDK / AWS SNS SDK (SMS delivery)
- Handlebars (Node.js) / Jinja2 (Python) for notification templates
- HashiCorp Vault / AWS Secrets Manager (email and SMS provider API keys)
- Docker + Kubernetes (containerization and horizontal scaling via consumer group parallelism)
- Prometheus + OpenTelemetry (metrics and distributed tracing)
- Dead-letter topic / queue (Kafka DLT or RabbitMQ DLQ) for failed notification handling
- **Responsibilities:**
- Consume UserRegistered events from the message broker (Kafka topic / RabbitMQ queue) with at-least-once delivery handling
- Dispatch email verification links to users who registered with an email address via SendGrid or AWS SES
- Dispatch SMS OTP codes to users who registered with a mobile number via Twilio or AWS SNS
- Implement idempotent event processing to safely handle duplicate event delivery
- Manage notification delivery retries with exponential backoff for transient provider failures
- Route failed notifications to a dead-letter queue for alerting and manual replay
- Render notification content using templated email and SMS message formats
- Log notification delivery status (sent, failed, retried) for audit and debugging purposes

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
