import {
  createEmailFieldInput,
  createRegistrationFormState,
  EmailErrorCopyRegistry,
  EmailFormatValidator,
  EmailValidationState,
  errorMessageFor,
} from '../public/email-validation';

describe('EmailFormatValidator (RFC 5322 practical subset)', () => {
  // T-001
  it.each(['', '   ', undefined, null, 42])('returns EMPTY for %p', (value) => {
    expect(EmailFormatValidator.validate(value)).toBe(EmailValidationState.EMPTY);
  });

  // T-003
  it.each([
    'user@example.com',
    'first.last@example.co.uk',
    "o'reilly+tag@sub.example.org",
    'USER@EXAMPLE.COM',
    '  padded@example.com  ',
    'a_b-c!#$%&*=?^`{|}~@example.io',
  ])('returns ACCEPTED for %p', (value) => {
    expect(EmailFormatValidator.validate(value)).toBe(EmailValidationState.ACCEPTED);
  });

  // T-002, T-004
  it.each([
    'notanemail',
    'user@',
    '@example.com',
    'user@example',
    'user@@example.com',
    'user@exam ple.com',
    'user@-example.com',
    'user@example.c',
    'user@example.123',
    '.user@example.com',
    'user.@example.com',
    'us..er@example.com',
    'user@[192.168.0.1]',
    '"quoted local"@example.com',
    `${'a'.repeat(65)}@example.com`,
    `user@${'a'.repeat(250)}.com`,
  ])('returns INVALID_FORMAT for %p', (value) => {
    expect(EmailFormatValidator.validate(value)).toBe(EmailValidationState.INVALID_FORMAT);
  });
});

describe('EmailErrorCopyRegistry', () => {
  it('exposes the UX-approved copy', () => {
    expect(EmailErrorCopyRegistry.ERROR_EMPTY).toBe('Please enter your email address.');
    expect(EmailErrorCopyRegistry.ERROR_INVALID_FORMAT).toBe(
      'Please enter a valid email address (e.g. name@example.com).',
    );
  });

  // T-011
  it('contains no stack traces, internal identifiers or system detail', () => {
    for (const copy of Object.values(EmailErrorCopyRegistry)) {
      expect(copy).not.toMatch(/(at\s+\w+\s*\(|Error:|Exception|stack|regex|RegExp|\{|\}|node_modules|[0-9a-f]{8}-[0-9a-f]{4})/i);
      expect(copy).toMatch(/^[A-Z][\w\s.,'()@-]+\.$/);
    }
  });

  it('is immutable', () => {
    expect(Object.isFrozen(EmailErrorCopyRegistry)).toBe(true);
    expect(Object.isFrozen(EmailValidationState)).toBe(true);
  });
});

describe('errorMessageFor', () => {
  // T-008
  it('resolves ERROR_EMPTY only once submission has been attempted', () => {
    expect(errorMessageFor(EmailValidationState.EMPTY, true)).toBe(EmailErrorCopyRegistry.ERROR_EMPTY);
    expect(errorMessageFor(EmailValidationState.EMPTY, false)).toBeNull();
  });

  // T-009
  it('resolves ERROR_INVALID_FORMAT regardless of submission attempt', () => {
    expect(errorMessageFor(EmailValidationState.INVALID_FORMAT, false)).toBe(
      EmailErrorCopyRegistry.ERROR_INVALID_FORMAT,
    );
    expect(errorMessageFor(EmailValidationState.INVALID_FORMAT, true)).toBe(
      EmailErrorCopyRegistry.ERROR_INVALID_FORMAT,
    );
  });

  // T-010
  it('is null for ACCEPTED', () => {
    expect(errorMessageFor(EmailValidationState.ACCEPTED, true)).toBeNull();
  });
});

describe('EmailFieldInput / RegistrationFormState', () => {
  // T-005
  it('blocks progression on invalid format', () => {
    const state = createRegistrationFormState('user@', false);
    expect(state.canProgress).toBe(false);
    expect(state.emailField).toEqual({
      rawValue: 'user@',
      validationState: 'INVALID_FORMAT',
      errorMessage: EmailErrorCopyRegistry.ERROR_INVALID_FORMAT,
      isSubmissionBlocked: true,
    });
  });

  // T-006
  it('blocks submission and shows the required-field error when empty on submit', () => {
    const state = createRegistrationFormState('', true);
    expect(state.submissionAttempted).toBe(true);
    expect(state.canProgress).toBe(false);
    expect(state.emailField.isSubmissionBlocked).toBe(true);
    expect(state.emailField.errorMessage).toBe(EmailErrorCopyRegistry.ERROR_EMPTY);
  });

  it('stays quiet on an untouched empty field before submission', () => {
    const field = createEmailFieldInput('');
    expect(field).toEqual({ rawValue: '', validationState: 'EMPTY', errorMessage: null, isSubmissionBlocked: true });
  });

  // T-007, T-010
  it('permits progression with no error when accepted', () => {
    const state = createRegistrationFormState('user@example.com', true);
    expect(state.canProgress).toBe(true);
    expect(state.emailField).toEqual({
      rawValue: 'user@example.com',
      validationState: 'ACCEPTED',
      errorMessage: null,
      isSubmissionBlocked: false,
    });
  });

  it('normalises non-string raw values', () => {
    expect(createEmailFieldInput(undefined).rawValue).toBe('');
  });
});
