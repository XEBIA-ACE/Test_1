/*
 * Client-side email field validation for the registration screen (US-011).
 *
 * UMD: served to the browser as a global `EmailValidation` and required by Jest
 * as a CommonJS module so the same logic is covered by unit tests.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.EmailValidation = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var EmailValidationState = Object.freeze({
    EMPTY: 'EMPTY',
    INVALID_FORMAT: 'INVALID_FORMAT',
    ACCEPTED: 'ACCEPTED',
  });

  // UX-approved copy (Technical Design §1.2). Compile-time constants only.
  var EmailErrorCopyRegistry = Object.freeze({
    ERROR_EMPTY: 'Please enter your email address.',
    ERROR_INVALID_FORMAT: 'Please enter a valid email address (e.g. name@example.com).',
  });

  // RFC 5322 practical subset: dot-atom local part, dotted domain with a
  // 2+ letter TLD. Quoted local parts and IP-address domain literals are
  // intentionally rejected (Technical Design §1.3).
  var LOCAL_PART = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\.[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*";
  var DOMAIN_LABEL = '[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?';
  var EMAIL_PATTERN = new RegExp('^' + LOCAL_PART + '@(?:' + DOMAIN_LABEL + '\\.)+[A-Za-z]{2,63}$');
  var MAX_LOCAL_PART_LENGTH = 64;
  var MAX_EMAIL_LENGTH = 254;

  var EmailFormatValidator = {
    validate: function (rawValue) {
      var value = typeof rawValue === 'string' ? rawValue.trim() : '';
      if (value === '') {
        return EmailValidationState.EMPTY;
      }
      if (value.length > MAX_EMAIL_LENGTH || value.indexOf('@') > MAX_LOCAL_PART_LENGTH) {
        return EmailValidationState.INVALID_FORMAT;
      }
      return EMAIL_PATTERN.test(value) ? EmailValidationState.ACCEPTED : EmailValidationState.INVALID_FORMAT;
    },
  };

  function errorMessageFor(validationState, submissionAttempted) {
    if (validationState === EmailValidationState.INVALID_FORMAT) {
      return EmailErrorCopyRegistry.ERROR_INVALID_FORMAT;
    }
    if (validationState === EmailValidationState.EMPTY && submissionAttempted) {
      return EmailErrorCopyRegistry.ERROR_EMPTY;
    }
    return null;
  }

  function createEmailFieldInput(rawValue, submissionAttempted) {
    var validationState = EmailFormatValidator.validate(rawValue);
    return {
      rawValue: typeof rawValue === 'string' ? rawValue : '',
      validationState: validationState,
      errorMessage: errorMessageFor(validationState, Boolean(submissionAttempted)),
      isSubmissionBlocked: validationState !== EmailValidationState.ACCEPTED,
    };
  }

  function createRegistrationFormState(rawEmail, submissionAttempted) {
    var emailField = createEmailFieldInput(rawEmail, submissionAttempted);
    return {
      emailField: emailField,
      submissionAttempted: Boolean(submissionAttempted),
      canProgress: emailField.validationState === EmailValidationState.ACCEPTED,
    };
  }

  return {
    EmailValidationState: EmailValidationState,
    EmailErrorCopyRegistry: EmailErrorCopyRegistry,
    EmailFormatValidator: EmailFormatValidator,
    errorMessageFor: errorMessageFor,
    createEmailFieldInput: createEmailFieldInput,
    createRegistrationFormState: createRegistrationFormState,
  };
});
