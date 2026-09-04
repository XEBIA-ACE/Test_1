import request from 'supertest';
import { createApp } from '../src/adapters/inbound/http/app';
import { bootstrap } from '../src/index';
import { buildService, PP_VERSION, TOS_VERSION, validRequest } from './helpers';

describe('HTTP adapter', () => {
  it('GET /auth/registration-meta exposes active versions and document links', async () => {
    const { service } = buildService();
    const res = await request(createApp(service)).get('/auth/registration-meta');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      tos_version: TOS_VERSION,
      tos_url: 'https://legal.example.com/terms',
      privacy_policy_version: PP_VERSION,
      privacy_policy_url: 'https://legal.example.com/privacy',
    });
  });

  it('POST /auth/register returns 201 without internal consent identifiers', async () => {
    const { service, store } = buildService();
    const res = await request(createApp(service)).post('/auth/register').send(validRequest);
    expect(res.status).toBe(201);
    expect(res.body).toEqual({ user_id: 'id-1', email: 'shopper@example.com', consent_recorded: true });
    expect(JSON.stringify(res.body)).not.toContain(store.consents.get('id-1')!.id);
  });

  it('POST /auth/register returns 422 CONSENT_REQUIRED with human-readable copy', async () => {
    const { service, store } = buildService();
    const res = await request(createApp(service))
      .post('/auth/register')
      .send({ ...validRequest, consent_accepted: false });
    expect(res.status).toBe(422);
    expect(res.body).toEqual({
      error_code: 'CONSENT_REQUIRED',
      field: 'consent_accepted',
      message: 'Please accept the Terms of Service and Privacy Policy to create your account.',
    });
    expect(res.body).not.toHaveProperty('stack');
    expect(store.users.size).toBe(0);
  });

  it('maps other domain errors to their status codes', async () => {
    const { service } = buildService();
    const app = createApp(service);
    await request(app).post('/auth/register').send(validRequest);
    const dup = await request(app).post('/auth/register').send(validRequest);
    expect(dup.status).toBe(409);
    expect(dup.body.error_code).toBe('ACCOUNT_EXISTS');
  });

  it('omits the field for errors not tied to an input', async () => {
    const { service, store } = buildService();
    store.documents = [];
    const res = await request(createApp(service)).get('/auth/registration-meta');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({
      error_code: 'DOCUMENT_VERSION_UNAVAILABLE',
      message: 'No active TOS document version is configured.',
    });
  });

  it('rejects malformed JSON and non-object bodies gracefully', async () => {
    const { service } = buildService();
    const app = createApp(service);
    const bad = await request(app).post('/auth/register').set('Content-Type', 'application/json').send('{oops');
    expect(bad.status).toBe(400);
    expect(bad.body.error_code).toBe('INVALID_JSON');

    const empty = await request(app).post('/auth/register');
    expect(empty.status).toBe(422);
    expect(empty.body.error_code).toBe('CONSENT_REQUIRED');
  });

  it('hides unexpected errors behind a generic message', async () => {
    const { service } = buildService();
    jest.spyOn(service, 'getRegistrationMeta').mockRejectedValue(new Error('secret internals'));
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const res = await request(createApp(service)).get('/auth/registration-meta');
    expect(res.status).toBe(500);
    expect(res.body.message).not.toContain('secret internals');
  });

  it('serves the registration screen with checkbox and document links', async () => {
    const { service } = buildService();
    const res = await request(createApp(service)).get('/register.html');
    expect(res.status).toBe(200);
    expect(res.text).toContain('id="consent"');
    expect(res.text).toContain('id="tos-link"');
    expect(res.text).toContain('id="privacy-link"');
    expect(res.text).toContain('role="alert"');
  });
});

describe('bootstrap', () => {
  it('uses default document versions and URLs when unconfigured', async () => {
    const res = await request(bootstrap({}).app).get('/auth/registration-meta');
    expect(res.body).toEqual({
      tos_version: '2026-01',
      tos_url: 'https://example.com/legal/terms',
      privacy_policy_version: '2026-01',
      privacy_policy_url: 'https://example.com/legal/privacy',
    });
  });

  it('wires production adapters and registers end to end', async () => {
    const { app, store } = bootstrap({
      TOS_VERSION: '2026-03',
      PRIVACY_POLICY_VERSION: '2026-02',
      CONSENT_REQUIRED_MESSAGE: 'Agree first please.',
    });
    const meta = await request(app).get('/auth/registration-meta');
    expect(meta.body).toMatchObject({ tos_version: '2026-03', privacy_policy_version: '2026-02' });

    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'a@b.co', password: 'Str0ng!Pass', consent_accepted: true });
    expect(res.status).toBe(201);
    const record = store.consents.get(res.body.user_id)!;
    expect(record).toMatchObject({ tosDocumentVersion: '2026-03', privacyPolicyDocumentVersion: '2026-02' });
    expect(record.acceptedAt).toBeInstanceOf(Date);
    expect(store.users.get(res.body.user_id)!.passwordHash).toMatch(/^scrypt\$/);
    expect(store.users.get(res.body.user_id)!.passwordHash).not.toContain('Str0ng!Pass');

    const denied = await request(app).post('/auth/register').send({ email: 'c@d.co', password: 'Str0ng!Pass' });
    expect(denied.body.message).toBe('Agree first please.');
  });
});
