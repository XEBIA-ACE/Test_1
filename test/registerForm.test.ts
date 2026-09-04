import { readFileSync } from 'fs';
import { join } from 'path';
import { ContentKey, StaticContentRegistry } from '../src/client/ContentRegistry';
import { bindRegisterForm, queryRegisterFormElements, RegisterFormElements } from '../src/client/registerForm';

const html = readFileSync(join(__dirname, '..', 'public', 'register.html'), 'utf8');
const content = new StaticContentRegistry();

function mount() {
  document.documentElement.innerHTML = html;
  const elements = queryRegisterFormElements(document);
  const onAdvance = jest.fn();
  const controller = bindRegisterForm(elements, onAdvance);
  return { elements, onAdvance, controller };
}

function type(input: HTMLInputElement, value: string) {
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

function blur(input: HTMLInputElement) {
  input.dispatchEvent(new Event('blur'));
}

function submit(form: HTMLFormElement) {
  form.dispatchEvent(new Event('submit', { cancelable: true }));
}

describe('registration form email field', () => {
  it('renders an accessible, labelled email field with no error initially (FR-001, FR-008)', () => {
    const { elements } = mount();
    expect(elements.emailLabel.textContent).toBe(content.getMessage(ContentKey.EMAIL_LABEL));
    expect(elements.emailLabel.getAttribute('for')).toBe(elements.emailInput.id);
    expect(elements.emailInput.getAttribute('aria-describedby')).toBe('email-error');
    expect(elements.emailInput.getAttribute('aria-required')).toBe('true');
    expect(elements.emailInput.getAttribute('aria-invalid')).toBe('false');
    expect(elements.emailError.getAttribute('role')).toBe('alert');
    expect(elements.emailError.getAttribute('aria-live')).toBe('assertive');
    expect(elements.emailError.hidden).toBe(true);
    expect(elements.emailError.textContent).toBe('');
  });

  it('AC1: a valid email shows no error and the form advances on submit', () => {
    const { elements, onAdvance, controller } = mount();
    type(elements.emailInput, 'user@example.com');
    expect(elements.emailError.hidden).toBe(true);
    expect(elements.emailInput.getAttribute('aria-invalid')).toBe('false');
    submit(elements.form);
    expect(onAdvance).toHaveBeenCalledWith(expect.objectContaining({ emailValue: 'user@example.com' }));
    expect(controller.advanced).toBe(true);
  });

  it('AC2: a malformed email shows an inline error beneath the field and blocks progression', () => {
    const { elements, onAdvance } = mount();
    type(elements.emailInput, 'user@');
    expect(elements.emailError.hidden).toBe(false);
    expect(elements.emailError.textContent).toBe(content.getMessage(ContentKey.EMAIL_ERROR_FORMAT));
    expect(elements.emailInput.getAttribute('aria-invalid')).toBe('true');
    expect(elements.emailInput.compareDocumentPosition(elements.emailError) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    submit(elements.form);
    expect(onAdvance).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(elements.emailInput);
  });

  it('AC3: submitting with an empty field shows the required error and blocks submission', () => {
    const { elements, onAdvance } = mount();
    submit(elements.form);
    expect(elements.emailError.textContent).toBe(content.getMessage(ContentKey.EMAIL_ERROR_EMPTY));
    expect(elements.emailInput.getAttribute('aria-invalid')).toBe('true');
    expect(onAdvance).not.toHaveBeenCalled();
  });

  it('AC4: correcting the value dismisses the error in real time', () => {
    const { elements } = mount();
    type(elements.emailInput, 'user@');
    expect(elements.emailError.hidden).toBe(false);
    type(elements.emailInput, 'user@example.com');
    expect(elements.emailError.hidden).toBe(true);
    expect(elements.emailError.textContent).toBe('');
    expect(elements.emailInput.getAttribute('aria-invalid')).toBe('false');
  });

  it('EC-002: blurring an untouched empty field shows the required error', () => {
    const { elements } = mount();
    blur(elements.emailInput);
    expect(elements.emailError.textContent).toBe(content.getMessage(ContentKey.EMAIL_ERROR_EMPTY));
  });

  it('prevents the native form submission', () => {
    const { elements } = mount();
    type(elements.emailInput, 'user@example.com');
    const event = new Event('submit', { cancelable: true });
    elements.form.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('uses a custom content registry when provided', () => {
    document.documentElement.innerHTML = html;
    const elements = queryRegisterFormElements(document);
    bindRegisterForm(elements, jest.fn(), { getMessage: (key) => `copy:${key}` });
    expect(elements.emailLabel.textContent).toBe('copy:EMAIL_LABEL');
    type(elements.emailInput, 'nope');
    expect(elements.emailError.textContent).toBe('copy:EMAIL_ERROR_FORMAT');
  });

  it('fails fast when a required element is missing from the page', () => {
    document.documentElement.innerHTML = '<form id="register-form"></form>';
    expect(() => queryRegisterFormElements(document)).toThrow('label[for="email"]');
  });

  it('exposes all required elements', () => {
    const { elements } = mount();
    const keys: Array<keyof RegisterFormElements> = ['form', 'emailLabel', 'emailInput', 'emailError', 'submitButton'];
    keys.forEach((key) => expect(elements[key]).toBeInstanceOf(HTMLElement));
  });
});
