export type DocumentType = 'TOS' | 'PRIVACY_POLICY';

export interface UserAccount {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  tosDocumentVersion: string;
  privacyPolicyDocumentVersion: string;
  acceptedAt: Date;
  registrationContext: 'REGISTRATION';
}

export interface DocumentVersionReference {
  id: string;
  documentType: DocumentType;
  versionIdentifier: string;
  documentUrl: string;
  isActive: boolean;
  effectiveFrom: Date;
}
