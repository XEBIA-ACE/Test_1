export type EmailValidationState = 'EMPTY' | 'INVALID_FORMAT' | 'ACCEPTED';

export const EmailValidationState: Readonly<{
  EMPTY: 'EMPTY';
  INVALID_FORMAT: 'INVALID_FORMAT';
  ACCEPTED: 'ACCEPTED';
}>;

export const EmailErrorCopyRegistry: Readonly<{
  ERROR_EMPTY: string;
  ERROR_INVALID_FORMAT: string;
}>;

export const EmailFormatValidator: {
  validate(rawValue: unknown): EmailValidationState;
};

export interface EmailFieldInput {
  rawValue: string;
  validationState: EmailValidationState;
  errorMessage: string | null;
  isSubmissionBlocked: boolean;
}

export interface RegistrationFormState {
  emailField: EmailFieldInput;
  submissionAttempted: boolean;
  canProgress: boolean;
}

export function errorMessageFor(validationState: EmailValidationState, submissionAttempted: boolean): string | null;
export function createEmailFieldInput(rawValue: unknown, submissionAttempted?: boolean): EmailFieldInput;
export function createRegistrationFormState(rawEmail: unknown, submissionAttempted?: boolean): RegistrationFormState;
