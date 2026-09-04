# Test_1
ACE scaffold: Test_1 — Auth Service

## Registration screen (US-017)

Client-side email input with inline RFC 5322 validation.

```
npm install
npm test          # jest + coverage (90% threshold)
npm run typecheck
npm run build     # compiles src/client -> public/js
npm run serve     # http://localhost:3000 -> public/register.html
```

- `src/client/EmailValidator.ts` — `EmailRfc5322Validator` (Untouched / Valid / InvalidFormat / InvalidEmpty)
- `src/client/ContentRegistry.ts` — UX-approved copy keyed by `ContentKey`
- `src/client/RegistrationViewModel.ts` — validation lifecycle (change-after-dirty, blur, submit)
- `src/client/registerForm.ts` — DOM binding, ARIA wiring
