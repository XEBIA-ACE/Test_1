import {
  ConsentValidationException,
  DocumentVersionUnavailableException,
  DuplicateAccountException,
  ValidationException,
} from '../domain/errors';
import { ConsentRecord, DocumentType, DocumentVersionReference, UserAccount } from '../domain/model';
import {
  Clock,
  ConsentRecordRepository,
  DocumentVersionRepository,
  IdGenerator,
  PasswordHasher,
  UnitOfWork,
  UserAccountRepository,
} from '../domain/ports';
import { ConsentValidator } from './ConsentValidator';

export interface RegistrationRequest {
  email?: unknown;
  password?: unknown;
  consent_accepted?: unknown;
  consent_payload?: { tos_version?: unknown; privacy_policy_version?: unknown } | null;
}

export interface RegistrationResult {
  user_id: string;
  email: string;
  consent_recorded: true;
}

export interface RegistrationMeta {
  tos_version: string;
  tos_url: string;
  privacy_policy_version: string;
  privacy_policy_url: string;
}

export interface RegistrationServiceDeps {
  users: UserAccountRepository;
  consents: ConsentRecordRepository;
  documents: DocumentVersionRepository;
  unitOfWork: UnitOfWork;
  hasher: PasswordHasher;
  clock: Clock;
  ids: IdGenerator;
  consentValidator: ConsentValidator;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

export class RegistrationService {
  constructor(private readonly deps: RegistrationServiceDeps) {}

  async getRegistrationMeta(): Promise<RegistrationMeta> {
    const [tos, privacy] = await this.resolveActiveVersions();
    return {
      tos_version: tos.versionIdentifier,
      tos_url: tos.documentUrl,
      privacy_policy_version: privacy.versionIdentifier,
      privacy_policy_url: privacy.documentUrl,
    };
  }

  async register(request: RegistrationRequest): Promise<RegistrationResult> {
    const consent = this.deps.consentValidator.validate(request);
    if (!consent.valid) {
      throw new ConsentValidationException(consent.message);
    }

    const email = this.validateEmail(request.email);
    const password = this.validatePassword(request.password);

    if (await this.deps.users.findByEmail(email)) {
      throw new DuplicateAccountException();
    }

    const [tos, privacy] = await this.resolveActiveVersions();
    this.checkClientVersions(request, tos, privacy);

    const passwordHash = await this.deps.hasher.hash(password);
    const acceptedAt = this.deps.clock.now();

    const account: UserAccount = {
      id: this.deps.ids.next(),
      email,
      passwordHash,
      createdAt: acceptedAt,
    };
    const record: ConsentRecord = {
      id: this.deps.ids.next(),
      userId: account.id,
      tosDocumentVersion: tos.versionIdentifier,
      privacyPolicyDocumentVersion: privacy.versionIdentifier,
      acceptedAt,
      registrationContext: 'REGISTRATION',
    };

    await this.deps.unitOfWork.runInTransaction(async () => {
      await this.deps.users.save(account);
      await this.deps.consents.save(record);
    });

    return { user_id: account.id, email: account.email, consent_recorded: true };
  }

  private async resolveActiveVersions(): Promise<[DocumentVersionReference, DocumentVersionReference]> {
    return Promise.all([this.requireActive('TOS'), this.requireActive('PRIVACY_POLICY')]);
  }

  private async requireActive(type: DocumentType): Promise<DocumentVersionReference> {
    const ref = await this.deps.documents.findActiveVersion(type);
    if (!ref) {
      throw new DocumentVersionUnavailableException(type);
    }
    return ref;
  }

  private checkClientVersions(
    request: RegistrationRequest,
    tos: DocumentVersionReference,
    privacy: DocumentVersionReference,
  ): void {
    const payload = request.consent_payload;
    if (!payload) return;
    const mismatch =
      (payload.tos_version !== undefined && payload.tos_version !== tos.versionIdentifier) ||
      (payload.privacy_policy_version !== undefined &&
        payload.privacy_policy_version !== privacy.versionIdentifier);
    if (mismatch) {
      throw new ValidationException(
        'consent_payload',
        'The Terms of Service or Privacy Policy have been updated. Please review and accept the latest version.',
      );
    }
  }

  private validateEmail(value: unknown): string {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new ValidationException('email', 'Email address is required.');
    }
    const email = value.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      throw new ValidationException('email', 'Please enter a valid email address.');
    }
    return email;
  }

  private validatePassword(value: unknown): string {
    if (typeof value !== 'string' || value.length < MIN_PASSWORD_LENGTH) {
      throw new ValidationException(
        'password',
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`,
      );
    }
    return value;
  }
}
