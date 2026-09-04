# Test_1 — Auth Service

ACE scaffold: Test_1. Node.js/TypeScript Auth Service (hexagonal architecture).

## Features

- **US-016** — Terms of Service & Privacy Policy consent capture on registration
  - `GET /auth/registration-meta` — active ToS / Privacy Policy versions and document URLs
  - `POST /auth/register` — requires `consent_accepted: true`; returns `422 CONSENT_REQUIRED` otherwise; persists a `ConsentRecord` atomically with the `UserAccount`
  - `/register.html` — reference registration screen (checkbox, document links, inline error, ARIA)
- **US-011** — Email address inline validation on the registration form
  - `/email-validation.js` — client-side `EmailFormatValidator` (RFC 5322 practical subset), `EmailErrorCopyRegistry` (UX-approved copy) and `RegistrationFormState` helpers; validated on blur, re-validated on each keystroke once touched, and enforced on submit
  - Empty on submit → "Please enter your email address."; invalid format → "Please enter a valid email address (e.g. name@example.com)."; errors are announced via `role="alert"` and reflected with `aria-invalid`

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
