-- V1: Create users table
CREATE TABLE IF NOT EXISTS users (
    id                   UUID PRIMARY KEY,
    email                VARCHAR(255) UNIQUE,
    phone_number         VARCHAR(20) UNIQUE,
    password_hash        TEXT,
    status               VARCHAR(20) NOT NULL DEFAULT 'PENDING'
                             CHECK (status IN ('PENDING', 'ACTIVE', 'LOCKED', 'DEACTIVATED')),
    registration_method  VARCHAR(20) NOT NULL
                             CHECK (registration_method IN ('EMAIL', 'MOBILE', 'GOOGLE', 'FACEBOOK')),
    oauth_provider       VARCHAR(50),
    oauth_provider_id    VARCHAR(255),
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until         TIMESTAMPTZ,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT users_email_or_phone CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_phone ON users (phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_oauth ON users (oauth_provider, oauth_provider_id)
    WHERE oauth_provider IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_status ON users (status);
