# Test_1 — Auth Service

ACE scaffold: Test_1. Node.js/TypeScript Auth Service (hexagonal architecture).

## Features

- **US-016** — Terms of Service & Privacy Policy consent capture on registration
  - `GET /auth/registration-meta` — active ToS / Privacy Policy versions and document URLs
  - `POST /auth/register` — requires `consent_accepted: true`; returns `422 CONSENT_REQUIRED` otherwise; persists a `ConsentRecord` atomically with the `UserAccount`
  - `/register.html` — reference registration screen (checkbox, document links, inline error, ARIA)

## Layout

```
src/domain        entities, errors, ports
src/application   RegistrationService, ConsentValidator, config
src/adapters      inbound HTTP (Express), outbound in-memory store + system adapters
migrations/       PostgreSQL schema for consent_records / document_version_references
test/             Jest unit + HTTP tests (90% coverage threshold)
```

## Run

```
npm install
npm test
npm run build && npm start   # http://localhost:3000/register.html
```

Configuration (env): `PORT`, `CONSENT_REQUIRED_MESSAGE`, `TOS_VERSION`, `TOS_URL`, `PRIVACY_POLICY_VERSION`, `PRIVACY_POLICY_URL`.
