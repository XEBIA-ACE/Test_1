import dotenv from 'dotenv';
dotenv.config();

export const config = {
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),
    logLevel: process.env.LOG_LEVEL ?? 'info',
  },
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '5432', 10),
    name: process.env.DB_NAME ?? 'product_db',
    user: process.env.DB_USER ?? 'product_user',
    password: process.env.DB_PASSWORD ?? '',
    poolMin: parseInt(process.env.DB_POOL_MIN ?? '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX ?? '10', 10),
    pgBouncerHost: process.env.PGBOUNCER_HOST ?? 'localhost',
    pgBouncerPort: parseInt(process.env.PGBOUNCER_PORT ?? '6432', 10),
  },
  elasticsearch: {
    node: process.env.ELASTICSEARCH_NODE ?? 'http://localhost:9200',
    username: process.env.ELASTICSEARCH_USERNAME ?? 'elastic',
    password: process.env.ELASTICSEARCH_PASSWORD ?? '',
    indexProducts: process.env.ELASTICSEARCH_INDEX_PRODUCTS ?? 'products',
  },
  redis: {
    host: process.env.REDIS_HOST ?? 'localhost',
    port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
    password: process.env.REDIS_PASSWORD ?? undefined,
    ttlSeconds: parseInt(process.env.REDIS_TTL_SECONDS ?? '300', 10),
    db: parseInt(process.env.REDIS_DB ?? '0', 10),
  },
  kafka: {
    brokers: (process.env.KAFKA_BROKERS ?? 'localhost:9092').split(','),
    clientId: process.env.KAFKA_CLIENT_ID ?? 'product-service',
    groupId: process.env.KAFKA_GROUP_ID ?? 'product-service-group',
    topicCatalogUpdated: process.env.KAFKA_TOPIC_CATALOG_UPDATED ?? 'catalog.updated',
  },
  circuitBreaker: {
    timeoutMs: parseInt(process.env.CB_TIMEOUT_MS ?? '3000', 10),
    errorThresholdPercentage: parseInt(process.env.CB_ERROR_THRESHOLD_PERCENTAGE ?? '50', 10),
    resetTimeoutMs: parseInt(process.env.CB_RESET_TIMEOUT_MS ?? '30000', 10),
  },
  observability: {
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'product-service',
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? 'http://localhost:4318',
    metricsPort: parseInt(process.env.METRICS_PORT ?? '9090', 10),
  },
};
