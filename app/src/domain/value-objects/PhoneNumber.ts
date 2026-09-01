export class PhoneNumber {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  /**
   * Accepts E.164 format: +<country_code><number>
   * e.g. +14155552671
   */
  static create(raw: string): PhoneNumber {
    const normalised = raw.trim().replace(/\s+/g, '');
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!e164Regex.test(normalised)) {
      throw new Error(`Invalid phone number (E.164 required): ${raw}`);
    }
    return new PhoneNumber(normalised);
  }

  toString(): string {
    return this.value;
  }

  equals(other: PhoneNumber): boolean {
    return this.value === other.value;
  }
}
