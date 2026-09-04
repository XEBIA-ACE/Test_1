import { bindRegisterForm, queryRegisterFormElements } from './registerForm.js';

const elements = queryRegisterFormElements(document);
const status = document.getElementById('form-status');

bindRegisterForm(elements, (state) => {
  if (status) status.textContent = `Email accepted: ${state.emailValue}. Continuing to the next step.`;
});
