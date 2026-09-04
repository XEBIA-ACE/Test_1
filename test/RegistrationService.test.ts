import {
  ConsentValidationException,
  DocumentVersionUnavailableException,
  DuplicateAccountException,
  ValidationException,
} from '../src/domain/errors';
import { buildService, FIXED_NOW, PP_VERSION, TOS_VERSION, validRequest } from './helpers';

describe('RegistrationService.register', () => {
  // TC-001 (FR-001, FR-010)
  it('rejects unconsented registration before any persistence call', async () => {
    const { service, deps } = buildService();
    const userSave = jest.spyOn(deps.users, 'save');
    const consentSave = jest.spyOn(deps.consents, 'save');

    await expect(service.register({ ...validRequest, consent_accepted: false })).rejects.toBeInstanceOf(
      ConsentValidationException,
    );

    expect(userSave).not.toHaveBeenCalled();
    expect(consentSave).not.toHaveBeenCalled();
  });

  it('surfaces the UX-approved copy and CONSENT_REQUIRED code', async () => {
    const { service } = buildService();
    const err = await service.register({ ...validRequest, consent_accepted: undefined }).catch((e) => e);
    expect(err).toMatchObject({
      errorCode: 'CONSENT_REQUIRED',
      httpStatus: 422,
      field: 'consent_accepted',
      message: 'Please accept the Terms of Service and Privacy Policy to create your account.',
    });
    expect(err.message).not.toMatch(/at .*\.(ts|js)/);
  });

  it('creates the account and exactly one linked consent record', async () => {
    const { service, store } = buildService();

    const result = await service.register(validRequest);

    expect(result).toEqual({ user_id: 'id-1', email: 'shopper@example.com', consent_recorded: true });
    const user = store.users.get('id-1');
    expect(user).toMatchObject({ email: 'shopper@example.com', passwordHash: 'hashed(Str0ng!Pass)' });
    expect(store.consents.size).toBe(1);
    expect(store.consents.get('id-1')).toEqual({
      id: 'id-2',
      userId: 'id-1',
      tosDocumentVersion: TOS_VERSION,
      privacyPolicyDocumentVersion: PP_VERSION,
      acceptedAt: FIXED_NOW,
      registrationContext: 'REGISTRATION',
    });
  });

  // TC-002 (FR-006)
  it('stamps accepted_at from the server clock, ignoring client timestamps', async () => {
    const { service, store } = buildService();
    await service.register({ ...validRequest, accepted_at: '2000-01-01T00:00:00Z' } as never);
    expect(store.consents.get('id-1')?.acceptedAt).toBe(FIXED_NOW);
  });

  // TC-003 (FR-007)
  it('records the active versions resolved from the document repository', async () => {
    const { service, store } = buildService({
      documents: {
        findActiveVersion: async (type) => ({
          id: `mock-${type}`,
          documentType: type,
          versionIdentifier: type === 'TOS' ? 'tos-mock-9' : 'pp-mock-4',
          documentUrl: 'https://x',
          isActive: true,
          effectiveFrom: FIXED_NOW,
        }),
      },
    });
    await service.register({ ...validRequest, consent_payload: null });
    expect(store.consents.get('id-1')).toMatchObject({
      tosDocumentVersion: 'tos-mock-9',
      privacyPolicyDocumentVersion: 'pp-mock-4',
    });
  });

  // TC-004 (FR-010)
  it('rolls back the user account when consent persistence fails', async () => {
    const { service, store, deps } = buildService();
    jest.spyOn(deps.consents, 'save').mockRejectedValue(new Error('db down'));

    await expect(service.register(validRequest)).rejects.toThrow('db down');

    expect(store.users.size).toBe(0);
    expect(store.consents.size).toBe(0);
  });

  it('rejects stale client-observed document versions', async () => {
    const { service, store } = buildService();
    await expect(
      service.register({ ...validRequest, consent_payload: { tos_version: 'tos-v3.1', privacy_policy_version: PP_VERSION } }),
    ).rejects.toMatchObject({ errorCode: 'VALIDATION_ERROR', field: 'consent_payload' });
    await expect(
      service.register({ ...validRequest, consent_payload: { tos_version: TOS_VERSION, privacy_policy_version: 'old' } }),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(store.users.size).toBe(0);
  });

  it('fails when no active document version exists', async () => {
    const { service, store } = buildService();
    store.documents = store.documents.filter((d) => d.documentType !== 'PRIVACY_POLICY');
    await expect(service.register(validRequest)).rejects.toBeInstanceOf(DocumentVersionUnavailableException);
    expect(store.users.size).toBe(0);
  });

  it('blocks duplicate emails', async () => {
    const { service } = buildService();
    await service.register(validRequest);
    await expect(service.register({ ...validRequest, email: 'Shopper@Example.com' })).rejects.toBeInstanceOf(
      DuplicateAccountException,
    );
  });

  it.each([
    [{ email: undefined }, 'email'],
    [{ email: 'not-an-email' }, 'email'],
    [{ password: 'short' }, 'password'],
    [{ password: 42 }, 'password'],
  ])('validates credential fields %p', async (patch, field) => {
    const { service } = buildService();
    await expect(service.register({ ...validRequest, ...patch })).rejects.toMatchObject({
      errorCode: 'VALIDATION_ERROR',
      field,
    });
  });
});

describe('RegistrationService.getRegistrationMeta', () => {
  it('returns active versions and URLs for both documents', async () => {
    const { service } = buildService();
    await expect(service.getRegistrationMeta()).resolves.toEqual({
      tos_version: TOS_VERSION,
      tos_url: 'https://legal.example.com/terms',
      privacy_policy_version: PP_VERSION,
      privacy_policy_url: 'https://legal.example.com/privacy',
    });
  });

  it('fails when a document has no active version', async () => {
    const { service, store } = buildService();
    store.documents = [];
    await expect(service.getRegistrationMeta()).rejects.toBeInstanceOf(DocumentVersionUnavailableException);
  });
});
