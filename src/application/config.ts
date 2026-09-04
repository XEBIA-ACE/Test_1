export interface ConsentConfig {
  /** UX-approved copy shown inline when consent is missing (A-002). */
  consentRequiredMessage: string;
}

export const DEFAULT_CONSENT_REQUIRED_MESSAGE =
  'Please accept the Terms of Service and Privacy Policy to create your account.';

export function loadConsentConfig(env: NodeJS.ProcessEnv = process.env): ConsentConfig {
  return {
    consentRequiredMessage: env.CONSENT_REQUIRED_MESSAGE || DEFAULT_CONSENT_REQUIRED_MESSAGE,
  };
}
