export enum EmailValidationStatus {
  Untouched = 'Untouched',
  Valid = 'Valid',
  InvalidFormat = 'InvalidFormat',
  InvalidEmpty = 'InvalidEmpty',
}

export interface EmailValidator {
  validate(value: string, isDirty: boolean, isTouched: boolean): EmailValidationStatus;
}

// RFC 5322 addr-spec, practical subset: dot-atom local part and a dotted
// domain ending in an alphabetic TLD. Quoted local parts and domain literals
// are rejected. Length limits follow RFC 5321 (64 local / 254 total).
const ATEXT = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+";
const DOT_ATOM = `${ATEXT}(?:\\.${ATEXT})*`;
const DOMAIN_LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?';
const RFC5322_PATTERN = new RegExp(`^${DOT_ATOM}@(?:${DOMAIN_LABEL}\\.)+[A-Za-z]{2,63}$`);
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_EMAIL_LENGTH = 254;

export class EmailRfc5322Validator implements EmailValidator {
  validate(value: string, isDirty: boolean, isTouched: boolean): EmailValidationStatus {
    const trimmed = value.trim();
    if (trimmed === '') {
      return isDirty || isTouched ? EmailValidationStatus.InvalidEmpty : EmailValidationStatus.Untouched;
    }
    if (trimmed.length > MAX_EMAIL_LENGTH || trimmed.indexOf('@') > MAX_LOCAL_PART_LENGTH) {
      return EmailValidationStatus.InvalidFormat;
    }
    return RFC5322_PATTERN.test(trimmed) ? EmailValidationStatus.Valid : EmailValidationStatus.InvalidFormat;
  }
}
