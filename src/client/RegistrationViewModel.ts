import { ContentKey, ContentRegistry } from './ContentRegistry.js';
import { EmailValidationStatus, EmailValidator } from './EmailValidator.js';

export interface RegistrationFormState {
  readonly emailValue: string;
  readonly emailValidationStatus: EmailValidationStatus;
  readonly activeErrorMessage: string | null;
  readonly submissionPermitted: boolean;
}

export type StateListener = (state: RegistrationFormState) => void;

/**
 * Owns the email field's validation lifecycle (ADR-002): validation runs on
 * every change once the field is dirty, on blur regardless of dirty state, and
 * on every submission attempt.
 */
export class RegistrationViewModel {
  private emailValue = '';
  private isDirty = false;
  private isTouched = false;
  private state: RegistrationFormState;
  private readonly listeners: StateListener[] = [];

  constructor(
    private readonly validator: EmailValidator,
    private readonly content: ContentRegistry,
  ) {
    this.state = this.buildState(EmailValidationStatus.Untouched);
  }

  getState(): RegistrationFormState {
    return this.state;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.push(listener);
    listener(this.state);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index >= 0) this.listeners.splice(index, 1);
    };
  }

  onEmailChanged(value: string): RegistrationFormState {
    this.emailValue = value;
    if (value !== '') this.isDirty = true;
    return this.isDirty ? this.revalidate() : this.state;
  }

  onEmailBlurred(): RegistrationFormState {
    this.isTouched = true;
    return this.revalidate();
  }

  onSubmitAttempted(): RegistrationFormState {
    this.isDirty = true;
    this.isTouched = true;
    return this.revalidate();
  }

  private revalidate(): RegistrationFormState {
    const status = this.validator.validate(this.emailValue, this.isDirty, this.isTouched);
    this.state = this.buildState(status);
    this.listeners.forEach((listener) => listener(this.state));
    return this.state;
  }

  private buildState(status: EmailValidationStatus): RegistrationFormState {
    return {
      emailValue: this.emailValue,
      emailValidationStatus: status,
      activeErrorMessage: this.errorMessageFor(status),
      submissionPermitted: status === EmailValidationStatus.Valid,
    };
  }

  private errorMessageFor(status: EmailValidationStatus): string | null {
    switch (status) {
      case EmailValidationStatus.InvalidFormat:
        return this.content.getMessage(ContentKey.EMAIL_ERROR_FORMAT);
      case EmailValidationStatus.InvalidEmpty:
        return this.content.getMessage(ContentKey.EMAIL_ERROR_EMPTY);
      default:
        return null;
    }
  }
}
