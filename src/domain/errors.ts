export class DomainError extends Error {
  constructor(
    public readonly errorCode: string,
    message: string,
    public readonly httpStatus: number,
    public readonly field?: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}

export class ConsentValidationException extends DomainError {
  constructor(message: string) {
    super('CONSENT_REQUIRED', message, 422, 'consent_accepted');
  }
}

export class ValidationException extends DomainError {
  constructor(field: string, message: string) {
    super('VALIDATION_ERROR', message, 422, field);
  }
}

export class DuplicateAccountException extends DomainError {
  constructor() {
    super(
      'ACCOUNT_EXISTS',
      'An account with this email already exists. Try logging in instead.',
      409,
      'email',
    );
  }
}

export class DocumentVersionUnavailableException extends DomainError {
  constructor(documentType: string) {
    super(
      'DOCUMENT_VERSION_UNAVAILABLE',
      `No active ${documentType} document version is configured.`,
      503,
    );
  }
}
