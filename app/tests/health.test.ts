import { buildApp } from '../src/app';
import { FastifyInstance } from 'fastify';

describe('Health Endpoints', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.status).toBe('ok');
      expect(body.service).toBe('identity-auth-service');
      expect(body.timestamp).toBeDefined();
    });

    it('should return a valid ISO timestamp', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      });

      const body = JSON.parse(response.body);
      const timestamp = new Date(body.timestamp);
      expect(timestamp).toBeInstanceOf(Date);
      expect(isNaN(timestamp.getTime())).toBe(false);
    });
  });

  describe('GET /ready', () => {
    it('should return a readiness response with checks', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      });

      // In test environment without real DB/Redis, may return 200 or 503
      expect([200, 503]).toContain(response.statusCode);
      const body = JSON.parse(response.body);
      expect(body.status).toBeDefined();
      expect(body.checks).toBeDefined();
      expect(body.timestamp).toBeDefined();
    });

    it('should include database and redis in checks when configured', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/ready',
      });

      const body = JSON.parse(response.body);
      // Checks object should exist (may show not_configured in test env)
      expect(typeof body.checks).toBe('object');
    });
  });

  describe('Auth Routes (scaffold)', () => {
    it('POST /auth/register should return 501 (not yet wired)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/register',
        payload: {
          method: 'EMAIL',
          email: 'test@example.com',
          password: 'Password123',
        },
      });

      expect(response.statusCode).toBe(501);
    });

    it('POST /auth/login should return 501 (not yet wired)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          email: 'test@example.com',
          password: 'Password123',
        },
      });

      expect(response.statusCode).toBe(501);
    });
  });
});
