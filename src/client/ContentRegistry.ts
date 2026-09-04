export enum ContentKey {
  EMAIL_LABEL = 'EMAIL_LABEL',
  EMAIL_ERROR_FORMAT = 'EMAIL_ERROR_FORMAT',
  EMAIL_ERROR_EMPTY = 'EMAIL_ERROR_EMPTY',
}

export interface ContentRegistry {
  getMessage(key: ContentKey): string;
}

// UX-approved copy. Single source of every user-facing string on the email field.
const UX_APPROVED_COPY: Readonly<Record<ContentKey, string>> = Object.freeze({
  [ContentKey.EMAIL_LABEL]: 'Email address',
  [ContentKey.EMAIL_ERROR_FORMAT]: 'Please enter a valid email address, for example name@example.com.',
  [ContentKey.EMAIL_ERROR_EMPTY]: 'Please enter your email address.',
});

export class StaticContentRegistry implements ContentRegistry {
  getMessage(key: ContentKey): string {
    return UX_APPROVED_COPY[key];
  }
}
