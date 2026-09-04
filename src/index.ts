import { createApp } from './adapters/inbound/http/app';
import {
  InMemoryConsentRecordRepository,
  InMemoryDocumentVersionRepository,
  InMemoryStore,
  InMemoryUserAccountRepository,
} from './adapters/outbound/memory/InMemoryStore';
import { ScryptPasswordHasher, SystemClock, UuidGenerator } from './adapters/outbound/system';
import { loadConsentConfig } from './application/config';
import { ConsentValidator } from './application/ConsentValidator';
import { RegistrationService } from './application/RegistrationService';

export function bootstrap(env: NodeJS.ProcessEnv = process.env) {
  const store = new InMemoryStore();
  const ids = new UuidGenerator();
  const now = new Date();
  store.documents.push(
    {
      id: ids.next(),
      documentType: 'TOS',
      versionIdentifier: env.TOS_VERSION || '2026-01',
      documentUrl: env.TOS_URL || 'https://example.com/legal/terms',
      isActive: true,
      effectiveFrom: now,
    },
    {
      id: ids.next(),
      documentType: 'PRIVACY_POLICY',
      versionIdentifier: env.PRIVACY_POLICY_VERSION || '2026-01',
      documentUrl: env.PRIVACY_POLICY_URL || 'https://example.com/legal/privacy',
      isActive: true,
      effectiveFrom: now,
    },
  );

  const registration = new RegistrationService({
    users: new InMemoryUserAccountRepository(store),
    consents: new InMemoryConsentRecordRepository(store),
    documents: new InMemoryDocumentVersionRepository(store),
    unitOfWork: store,
    hasher: new ScryptPasswordHasher(),
    clock: new SystemClock(),
    ids,
    consentValidator: new ConsentValidator(loadConsentConfig(env)),
  });

  return { app: createApp(registration), store, registration };
}

/* istanbul ignore next */
if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  bootstrap().app.listen(port, () => console.log(`auth-service listening on :${port}`));
}
