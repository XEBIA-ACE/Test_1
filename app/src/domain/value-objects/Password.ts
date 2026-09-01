/**
 * Value object representing a raw (unhashed) password.
 * Enforces minimum complexity rules before the password is hashed.
 */
export class Password {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(raw: string): Password {
    if (raw.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(raw)) {
      throw new Error('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(raw)) {
      throw new Error('Password must contain at least one lowercase letter');
    }
    if (!/\d/.test(raw)) {
      throw new Error('Password must contain at least one digit');
    }
    return new Password(raw);
  }

  toString(): string {
    return this.value;
  }
}
