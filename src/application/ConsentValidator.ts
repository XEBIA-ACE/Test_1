import { ConsentConfig } from './config';

export interface ConsentInput {
  consent_accepted?: unknown;
}

export type ValidationResult =
  | { valid: true }
  | { valid: false; errorCode: 'CONSENT_REQUIRED'; message: string; field: 'consent_accepted' };

export class ConsentValidator {
  constructor(private readonly config: ConsentConfig) {}

  validate(input: ConsentInput): ValidationResult {
    if (input.consent_accepted === true) {
      return { valid: true };
    }
    return {
      valid: false,
      errorCode: 'CONSENT_REQUIRED',
      message: this.config.consentRequiredMessage,
      field: 'consent_accepted',
    };
  }
}
