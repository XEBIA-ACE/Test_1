import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const configSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']).default('development'),
  port: z.coerce.number().default(3000),
  logLevel: z.string().default('info'),
  serviceName: z.string().default('identity-auth-service'),

  // Database
  db: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().default(5432),
    name: z.string().default('auth_db'),
    user: z.string().default('auth_user'),
    password: z.string().default('changeme'),
    poolMin: z.coerce.number().default(2),
    poolMax: z.coerce.number().default(10),
    ssl: z.coerce.boolean().default(false),
  }),

  // Redis
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.coerce.number().default(6379),
    password: z.string().optional(),
    db: z.coerce.number().default(0),
    tls: z.coerce.boolean().default(false),
  }),

  // JWT
  jwt: z.object({
    privateKeyPath: z.string().default('./keys/private.pem'),
    publicKeyPath: z.string().default('./keys/public.pem'),
    accessTokenExpiry: z.coerce.number().default(900),
    refreshTokenExpiry: z.coerce.number().default(2592000),
    issuer: z.string().default('identity-auth-service'),
    audience: z.string().default('platform-services'),
  }),

  // Vault
  vault: z.object({
    addr: z.string().default('http://localhost:8200'),
    token: z.string().default('root'),
    jwtSecretPath: z.string().default('secret/data/auth/jwt'),
    dbSecretPath: z.string().default('secret/data/auth/db'),
    enabled: z.coerce.boolean().default(false),
  }),

  // Kafka
  kafka: z.object({
    brokers: z.string().default('localhost:9092'),
    clientId: z.string().default('identity-auth-service'),
    groupId: z.string().default('identity-auth-group'),
    topicUserEvents: z.string().default('user.events'),
    ssl: z.coerce.boolean().default(false),
  }),

  // OTP
  otp: z.object({
    ttlSeconds: z.coerce.number().default(300),
    length: z.coerce.number().default(6),
    maxAttempts: z.coerce.number().default(3),
  }),

  // Lockout
  lockout: z.object({
    maxAttempts: z.coerce.number().default(5),
    windowSeconds: z.coerce.number().default(900),
    durationSeconds: z.coerce.number().default(1800),
  }),

  // OAuth2
  oauth: z.object({
    google: z.object({
      clientId: z.string().default(''),
      clientSecret: z.string().default(''),
      callbackUrl: z.string().default('http://localhost:3000/auth/oauth/google/callback'),
    }),
    facebook: z.object({
      clientId: z.string().default(''),
      clientSecret: z.string().default(''),
      callbackUrl: z.string().default('http://localhost:3000/auth/oauth/facebook/callback'),
    }),
  }),

  // OpenTelemetry
  otel: z.object({
    endpoint: z.string().default('http://localhost:4317'),
    serviceName: z.string().default('identity-auth-service'),
    enabled: z.coerce.boolean().default(false),
  }),

  // Outbox
  outbox: z.object({
    pollIntervalMs: z.coerce.number().default(5000),
    batchSize: z.coerce.number().default(100),
  }),
});

export type AppConfig = z.infer<typeof configSchema>;

function loadConfig(): AppConfig {
  return configSchema.parse({
    nodeEnv: process.env.NODE_ENV,
    port: process.env.PORT,
    logLevel: process.env.LOG_LEVEL,
    serviceName: process.env.SERVICE_NAME,
    db: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      name: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      poolMin: process.env.DB_POOL_MIN,
      poolMax: process.env.DB_POOL_MAX,
      ssl: process.env.DB_SSL,
    },
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD || undefined,
      db: process.env.REDIS_DB,
      tls: process.env.REDIS_TLS,
    },
    jwt: {
      privateKeyPath: process.env.JWT_PRIVATE_KEY_PATH,
      publicKeyPath: process.env.JWT_PUBLIC_KEY_PATH,
      accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY,
      refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY,
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    },
    vault: {
      addr: process.env.VAULT_ADDR,
      token: process.env.VAULT_TOKEN,
      jwtSecretPath: process.env.VAULT_JWT_SECRET_PATH,
      dbSecretPath: process.env.VAULT_DB_SECRET_PATH,
      enabled: process.env.VAULT_ENABLED,
    },
    kafka: {
      brokers: process.env.KAFKA_BROKERS,
      clientId: process.env.KAFKA_CLIENT_ID,
      groupId: process.env.KAFKA_GROUP_ID,
      topicUserEvents: process.env.KAFKA_TOPIC_USER_EVENTS,
      ssl: process.env.KAFKA_SSL,
    },
    otp: {
      ttlSeconds: process.env.OTP_TTL_SECONDS,
      length: process.env.OTP_LENGTH,
      maxAttempts: process.env.OTP_MAX_ATTEMPTS,
    },
    lockout: {
      maxAttempts: process.env.LOCKOUT_MAX_ATTEMPTS,
      windowSeconds: process.env.LOCKOUT_WINDOW_SECONDS,
      durationSeconds: process.env.LOCKOUT_DURATION_SECONDS,
    },
    oauth: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
      },
      facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackUrl: process.env.FACEBOOK_CALLBACK_URL,
      },
    },
    otel: {
      endpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      serviceName: process.env.OTEL_SERVICE_NAME,
      enabled: process.env.OTEL_ENABLED,
    },
    outbox: {
      pollIntervalMs: process.env.OUTBOX_POLL_INTERVAL_MS,
      batchSize: process.env.OUTBOX_BATCH_SIZE,
    },
  });
}

export const config = loadConfig();
