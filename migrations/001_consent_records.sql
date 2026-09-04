-- US-016: Terms of Service & Privacy Policy consent capture on registration

CREATE TABLE IF NOT EXISTS user_accounts (
    id            UUID PRIMARY KEY,
    email         VARCHAR(320) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE legal_document_type AS ENUM ('TOS', 'PRIVACY_POLICY');

CREATE TABLE document_version_references (
    id                 UUID PRIMARY KEY,
    document_type      legal_document_type NOT NULL,
    version_identifier VARCHAR(64) NOT NULL,
    document_url       TEXT NOT NULL,
    is_active          BOOLEAN NOT NULL DEFAULT FALSE,
    effective_from     TIMESTAMPTZ NOT NULL
);

-- Exactly one active version per document type.
CREATE UNIQUE INDEX document_version_references_one_active_idx
    ON document_version_references (document_type)
    WHERE is_active = TRUE;

CREATE TABLE consent_records (
    id                              UUID PRIMARY KEY,
    user_id                         UUID NOT NULL UNIQUE REFERENCES user_accounts (id) ON DELETE CASCADE,
    tos_document_version            VARCHAR(64) NOT NULL,
    privacy_policy_document_version VARCHAR(64) NOT NULL,
    accepted_at                     TIMESTAMPTZ NOT NULL,
    registration_context            VARCHAR(32) NOT NULL DEFAULT 'REGISTRATION'
);
