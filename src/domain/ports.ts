import { ConsentRecord, DocumentType, DocumentVersionReference, UserAccount } from './model';

export interface UserAccountRepository {
  save(account: UserAccount): Promise<void>;
  findByEmail(email: string): Promise<UserAccount | undefined>;
  findById(id: string): Promise<UserAccount | undefined>;
}

export interface ConsentRecordRepository {
  save(record: ConsentRecord): Promise<void>;
  findByUserId(userId: string): Promise<ConsentRecord | undefined>;
}

export interface DocumentVersionRepository {
  findActiveVersion(documentType: DocumentType): Promise<DocumentVersionReference | undefined>;
}

export interface UnitOfWork {
  runInTransaction<T>(work: () => Promise<T>): Promise<T>;
}

export interface PasswordHasher {
  hash(plaintext: string): Promise<string>;
}

export interface Clock {
  now(): Date;
}

export interface IdGenerator {
  next(): string;
}
