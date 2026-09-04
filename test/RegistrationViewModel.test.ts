import { ContentKey, StaticContentRegistry } from '../src/client/ContentRegistry';
import { EmailRfc5322Validator, EmailValidationStatus } from '../src/client/EmailValidator';
import { RegistrationViewModel } from '../src/client/RegistrationViewModel';

const content = new StaticContentRegistry();
const FORMAT_ERROR = content.getMessage(ContentKey.EMAIL_ERROR_FORMAT);
const EMPTY_ERROR = content.getMessage(ContentKey.EMAIL_ERROR_EMPTY);

function createViewModel(): RegistrationViewModel {
  return new RegistrationViewModel(new EmailRfc5322Validator(), content);
}

describe('RegistrationViewModel', () => {
  it('starts untouched with no error and submission not permitted', () => {
    const state = createViewModel().getState();
    expect(state).toEqual({
      emailValue: '',
      emailValidationStatus: EmailValidationStatus.Untouched,
      activeErrorMessage: null,
      submissionPermitted: false,
    });
  });

  it('AC1: a valid email shows no error and permits the flow to advance', () => {
    const vm = createViewModel();
    const state = vm.onEmailChanged('user@example.com');
    expect(state.emailValidationStatus).toBe(EmailValidationStatus.Valid);
    expect(state.activeErrorMessage).toBeNull();
    expect(state.submissionPermitted).toBe(true);
    expect(vm.onSubmitAttempted().submissionPermitted).toBe(true);
  });

  it('AC2: a malformed email shows the format error and blocks progression', () => {
    const state = createViewModel().onEmailChanged('user@');
    expect(state.emailValidationStatus).toBe(EmailValidationStatus.InvalidFormat);
    expect(state.activeErrorMessage).toBe(FORMAT_ERROR);
    expect(state.submissionPermitted).toBe(false);
  });

  it('AC3: submitting with an empty field shows the required error and blocks submission', () => {
    const state = createViewModel().onSubmitAttempted();
    expect(state.emailValidationStatus).toBe(EmailValidationStatus.InvalidEmpty);
    expect(state.activeErrorMessage).toBe(EMPTY_ERROR);
    expect(state.submissionPermitted).toBe(false);
  });

  it('AC4: correcting the value dismisses the error in real time', () => {
    const vm = createViewModel();
    expect(vm.onEmailChanged('user@').activeErrorMessage).toBe(FORMAT_ERROR);
    const corrected = vm.onEmailChanged('user@example.com');
    expect(corrected.activeErrorMessage).toBeNull();
    expect(corrected.submissionPermitted).toBe(true);
  });

  it('EC-001: a value that becomes invalid mid-typing shows the error without blur', () => {
    const vm = createViewModel();
    expect(vm.onEmailChanged('user@example.com').activeErrorMessage).toBeNull();
    expect(vm.onEmailChanged('user@example.com@').activeErrorMessage).toBe(FORMAT_ERROR);
  });

  it('EC-002: blurring an empty untouched field shows the required error', () => {
    const state = createViewModel().onEmailBlurred();
    expect(state.emailValidationStatus).toBe(EmailValidationStatus.InvalidEmpty);
    expect(state.activeErrorMessage).toBe(EMPTY_ERROR);
  });

  it('does not validate on change until the field is dirty', () => {
    const vm = createViewModel();
    const state = vm.onEmailChanged('');
    expect(state.emailValidationStatus).toBe(EmailValidationStatus.Untouched);
    expect(state.activeErrorMessage).toBeNull();
  });

  it('clearing a dirty field shows the required error', () => {
    const vm = createViewModel();
    vm.onEmailChanged('u');
    expect(vm.onEmailChanged('').activeErrorMessage).toBe(EMPTY_ERROR);
  });

  it('notifies subscribers immediately and on every revalidation; unsubscribe stops notifications', () => {
    const vm = createViewModel();
    const listener = jest.fn();
    const unsubscribe = vm.subscribe(listener);
    expect(listener).toHaveBeenCalledTimes(1);
    vm.onEmailChanged('user@');
    expect(listener).toHaveBeenCalledTimes(2);
    unsubscribe();
    unsubscribe();
    vm.onEmailChanged('user@example.com');
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('error copy is sourced from the content registry and contains no technical details', () => {
    const registry = { getMessage: jest.fn((key: ContentKey) => `copy:${key}`) };
    const vm = new RegistrationViewModel(new EmailRfc5322Validator(), registry);
    expect(vm.onEmailChanged('bad').activeErrorMessage).toBe('copy:EMAIL_ERROR_FORMAT');
    expect(vm.onEmailChanged('').activeErrorMessage).toBe('copy:EMAIL_ERROR_EMPTY');
    for (const message of [FORMAT_ERROR, EMPTY_ERROR]) {
      expect(message).not.toMatch(/stack|exception|error:|regex|rfc|undefined|null|\bat\b/i);
    }
  });
});
