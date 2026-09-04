import { EmailRfc5322Validator, EmailValidationStatus } from '../src/client/EmailValidator';

describe('EmailRfc5322Validator', () => {
  const validator = new EmailRfc5322Validator();
  const { Untouched, Valid, InvalidFormat, InvalidEmpty } = EmailValidationStatus;

  it('returns Untouched for an empty, untouched, clean field', () => {
    expect(validator.validate('', false, false)).toBe(Untouched);
  });

  it('returns InvalidEmpty for an empty field that was touched (EC-002)', () => {
    expect(validator.validate('', false, true)).toBe(InvalidEmpty);
    expect(validator.validate('   ', true, true)).toBe(InvalidEmpty);
  });

  it.each([
    'user@example.com',
    'first.last@sub.example.co.uk',
    "o'reilly+tag@example.io",
    'user_name-1@example-domain.org',
  ])('accepts RFC 5322 address %s', (email) => {
    expect(validator.validate(email, true, true)).toBe(Valid);
  });

  it.each([
    'user@',
    '@example.com',
    'user@example',
    'user example@example.com',
    'user@@example.com',
    'user..name@example.com',
    '.user@example.com',
    'user@-example.com',
    'user@example.c',
    'user@exa_mple.com',
    'plainaddress',
  ])('rejects malformed address %s', (email) => {
    expect(validator.validate(email, true, true)).toBe(InvalidFormat);
  });

  it('rejects addresses exceeding RFC length limits', () => {
    expect(validator.validate(`${'a'.repeat(65)}@example.com`, true, true)).toBe(InvalidFormat);
    expect(validator.validate(`a@${'b'.repeat(250)}.com`, true, true)).toBe(InvalidFormat);
  });

  it('transitions from Valid to InvalidFormat as the user keeps typing (EC-001)', () => {
    expect(validator.validate('user@example.com', true, true)).toBe(Valid);
    expect(validator.validate('user@example.com@', true, true)).toBe(InvalidFormat);
  });

  it('trims surrounding whitespace before validating', () => {
    expect(validator.validate('  user@example.com ', true, true)).toBe(Valid);
  });
});
