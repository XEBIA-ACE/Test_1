import { ContentKey, ContentRegistry, StaticContentRegistry } from './ContentRegistry.js';
import { EmailRfc5322Validator } from './EmailValidator.js';
import { RegistrationFormState, RegistrationViewModel } from './RegistrationViewModel.js';

export interface RegisterFormElements {
  form: HTMLFormElement;
  emailLabel: HTMLLabelElement;
  emailInput: HTMLInputElement;
  emailError: HTMLElement;
  submitButton: HTMLButtonElement;
}

export interface RegisterFormController {
  viewModel: RegistrationViewModel;
  advanced: boolean;
}

export function queryRegisterFormElements(root: ParentNode): RegisterFormElements {
  const query = <T extends Element>(selector: string): T => {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing registration form element: ${selector}`);
    return element;
  };
  return {
    form: query<HTMLFormElement>('#register-form'),
    emailLabel: query<HTMLLabelElement>('label[for="email"]'),
    emailInput: query<HTMLInputElement>('#email'),
    emailError: query<HTMLElement>('#email-error'),
    submitButton: query<HTMLButtonElement>('button[type="submit"]'),
  };
}

export function renderEmailField(elements: RegisterFormElements, state: RegistrationFormState): void {
  const hasError = state.activeErrorMessage !== null;
  elements.emailError.textContent = state.activeErrorMessage ?? '';
  elements.emailError.hidden = !hasError;
  elements.emailInput.setAttribute('aria-invalid', hasError ? 'true' : 'false');
}

export function bindRegisterForm(
  elements: RegisterFormElements,
  onAdvance: (state: RegistrationFormState) => void,
  content: ContentRegistry = new StaticContentRegistry(),
): RegisterFormController {
  const viewModel = new RegistrationViewModel(new EmailRfc5322Validator(), content);
  const controller: RegisterFormController = { viewModel, advanced: false };

  elements.emailLabel.textContent = content.getMessage(ContentKey.EMAIL_LABEL);
  elements.emailInput.setAttribute('aria-describedby', elements.emailError.id);
  elements.emailInput.setAttribute('aria-required', 'true');
  elements.emailError.setAttribute('role', 'alert');
  elements.emailError.setAttribute('aria-live', 'assertive');

  viewModel.subscribe((state) => renderEmailField(elements, state));

  elements.emailInput.addEventListener('input', () => viewModel.onEmailChanged(elements.emailInput.value));
  elements.emailInput.addEventListener('blur', () => viewModel.onEmailBlurred());
  elements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const state = viewModel.onSubmitAttempted();
    if (!state.submissionPermitted) {
      elements.emailInput.focus();
      return;
    }
    controller.advanced = true;
    onAdvance(state);
  });

  return controller;
}
