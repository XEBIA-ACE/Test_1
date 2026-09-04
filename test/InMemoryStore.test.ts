import {
  InMemoryConsentRecordRepository,
  InMemoryStore,
  InMemoryUserAccountRepository,
} from '../src/adapters/outbound/memory/InMemoryStore';
import { ConsentRecord, UserAccount } from '../src/domain/model';

const user: UserAccount = { id: 'u1', email: 'a@b.co', passwordHash: 'h', createdAt: new Date() };
const consent: ConsentRecord = {
  id: 'c1',
  userId: 'u1',
  tosDocumentVersion: 'v1',
  privacyPolicyDocumentVersion: 'v1',
  acceptedAt: new Date(),
  registrationContext: 'REGISTRATION',
};

describe('InMemory repositories', () => {
  it('finds users by id and email', async () => {
    const store = new InMemoryStore();
    const users = new InMemoryUserAccountRepository(store);
    await users.save(user);
    expect(await users.findById('u1')).toBe(user);
    expect(await users.findById('nope')).toBeUndefined();
    expect(await users.findByEmail('a@b.co')).toBe(user);
    expect(await users.findByEmail('x@y.z')).toBeUndefined();
  });

  it('enforces one consent record per user', async () => {
    const store = new InMemoryStore();
    const consents = new InMemoryConsentRecordRepository(store);
    await consents.save(consent);
    expect(await consents.findByUserId('u1')).toBe(consent);
    await expect(consents.save({ ...consent, id: 'c2' })).rejects.toThrow(/already exists/);
  });

  it('commits successful transactions', async () => {
    const store = new InMemoryStore();
    const users = new InMemoryUserAccountRepository(store);
    await store.runInTransaction(() => users.save(user));
    expect(store.users.size).toBe(1);
  });
});
