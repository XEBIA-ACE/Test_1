// Global test setup
process.env.NODE_ENV = 'test';
process.env.PORT = '0';
process.env.LOG_LEVEL = 'silent';
process.env.VAULT_ENABLED = 'false';
process.env.OTEL_ENABLED = 'false';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.DB_NAME = 'auth_db_test';
process.env.DB_USER = 'auth_user';
process.env.DB_PASSWORD = 'changeme';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.JWT_PRIVATE_KEY_PATH = './keys/private.pem';
process.env.JWT_PUBLIC_KEY_PATH = './keys/public.pem';
