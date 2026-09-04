import { ConsentValidator } from '../src/application/ConsentValidator';
import { DEFAULT_CONSENT_REQUIRED_MESSAGE, loadConsentConfig } from '../src/application/config';

describe('ConsentValidator', () => {
  const validator = new ConsentValidator({ consentRequiredMessage: 'Custom UX copy' });

  it('accepts an explicit true consent flag', () => {
    expect(validator.validate({ consent_accepted: true })).toEqual({ valid: true });
  });

  // TC-005 (FR-001, FR-002)
  it.each([null, undefined, false, 'true', 1, 'yes'])(
    'returns CONSENT_REQUIRED with the configured message for consent_accepted=%p',
    (value) => {
      expect(validator.validate({ consent_accepted: value })).toEqual({
        valid: false,
        errorCode: 'CONSENT_REQUIRED',
        message: 'Custom UX copy',
        field: 'consent_accepted',
      });
    },
  );
});

describe('loadConsentConfig', () => {
  it('falls back to the default UX-approved copy', () => {
    expect(loadConsentConfig({}).consentRequiredMessage).toBe(DEFAULT_CONSENT_REQUIRED_MESSAGE);
  });

  it('reads the configurable message from the environment', () => {
    expect(loadConsentConfig({ CONSENT_REQUIRED_MESSAGE: 'Please agree first.' }).consentRequiredMessage).toBe(
      'Please agree first.',
    );
  });
});
