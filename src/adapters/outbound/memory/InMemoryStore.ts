import { ConsentRecord, DocumentType, DocumentVersionReference, UserAccount } from '../../../domain/model';
import {
  ConsentRecordRepository,
  DocumentVersionRepository,
  UnitOfWork,
  UserAccountRepository,
} from '../../../domain/ports';

/**
 * Single in-memory store shared by all repositories so the unit of work can
 * snapshot and roll back every table atomically.
 */
export class InMemoryStore implements UnitOfWork {
  users = new Map<string, UserAccount>();
  consents = new Map<string, ConsentRecord>();
  documents: DocumentVersionReference[] = [];

  async runInTransaction<T>(work: () => Promise<T>): Promise<T> {
    const usersSnapshot = new Map(this.users);
    const consentsSnapshot = new Map(this.consents);
    try {
      return await work();
    } catch (err) {
      this.users = usersSnapshot;
      this.consents = consentsSnapshot;
      throw err;
    }
  }
}

export class InMemoryUserAccountRepository implements UserAccountRepository {
  constructor(private readonly store: InMemoryStore) {}

  async save(account: UserAccount): Promise<void> {
    this.store.users.set(account.id, account);
  }

  async findByEmail(email: string): Promise<UserAccount | undefined> {
    for (const user of this.store.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async findById(id: string): Promise<UserAccount | undefined> {
    return this.store.users.get(id);
  }
}

export class InMemoryConsentRecordRepository implements ConsentRecordRepository {
  constructor(private readonly store: InMemoryStore) {}

  async save(record: ConsentRecord): Promise<void> {
    if (this.store.consents.has(record.userId)) {
      throw new Error(`Consent record already exists for user ${record.userId}`);
    }
    this.store.consents.set(record.userId, record);
  }

  async findByUserId(userId: string): Promise<ConsentRecord | undefined> {
    return this.store.consents.get(userId);
  }
}

export class InMemoryDocumentVersionRepository implements DocumentVersionRepository {
  constructor(private readonly store: InMemoryStore) {}

  async findActiveVersion(documentType: DocumentType): Promise<DocumentVersionReference | undefined> {
    return this.store.documents.find((d) => d.documentType === documentType && d.isActive);
  }
}
