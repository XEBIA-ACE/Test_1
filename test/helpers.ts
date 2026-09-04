import {
  InMemoryConsentRecordRepository,
  InMemoryDocumentVersionRepository,
  InMemoryStore,
  InMemoryUserAccountRepository,
} from '../src/adapters/outbound/memory/InMemoryStore';
import { DEFAULT_CONSENT_REQUIRED_MESSAGE } from '../src/application/config';
import { ConsentValidator } from '../src/application/ConsentValidator';
import { RegistrationService, RegistrationServiceDeps } from '../src/application/RegistrationService';

export const FIXED_NOW = new Date('2026-09-04T10:15:30.000Z');
export const TOS_VERSION = 'tos-v3.2';
export const PP_VERSION = 'pp-v1.7';

export function seedDocuments(store: InMemoryStore): void {
  store.documents.push(
    {
      id: 'doc-tos-old',
      documentType: 'TOS',
      versionIdentifier: 'tos-v3.1',
      documentUrl: 'https://legal.example.com/terms/3.1',
      isActive: false,
      effectiveFrom: new Date('2025-01-01T00:00:00Z'),
    },
    {
      id: 'doc-tos',
      documentType: 'TOS',
      versionIdentifier: TOS_VERSION,
      documentUrl: 'https://legal.example.com/terms',
      isActive: true,
      effectiveFrom: new Date('2026-01-01T00:00:00Z'),
    },
    {
      id: 'doc-pp',
      documentType: 'PRIVACY_POLICY',
      versionIdentifier: PP_VERSION,
      documentUrl: 'https://legal.example.com/privacy',
      isActive: true,
      effectiveFrom: new Date('2026-01-01T00:00:00Z'),
    },
  );
}

export function buildService(overrides: Partial<RegistrationServiceDeps> = {}) {
  const store = new InMemoryStore();
  seedDocuments(store);
  let counter = 0;
  const deps: RegistrationServiceDeps = {
    users: new InMemoryUserAccountRepository(store),
    consents: new InMemoryConsentRecordRepository(store),
    documents: new InMemoryDocumentVersionRepository(store),
    unitOfWork: store,
    hasher: { hash: async (p) => `hashed(${p})` },
    clock: { now: () => FIXED_NOW },
    ids: { next: () => `id-${++counter}` },
    consentValidator: new ConsentValidator({ consentRequiredMessage: DEFAULT_CONSENT_REQUIRED_MESSAGE }),
    ...overrides,
  };
  return { service: new RegistrationService(deps), store, deps };
}

export const validRequest = {
  email: 'shopper@example.com',
  password: 'Str0ng!Pass',
  consent_accepted: true,
  consent_payload: { tos_version: TOS_VERSION, privacy_policy_version: PP_VERSION },
};
