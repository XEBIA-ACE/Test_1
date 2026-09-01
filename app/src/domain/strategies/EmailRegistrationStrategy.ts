import { User } from '../entities/User';
import { Email } from '../value-objects/Email';
import { Password } from '../value-objects/Password';
import { PasswordService } from '../services/PasswordService';
import { IUserRepository } from '../ports/outbound/IUserRepository';

export interface EmailRegistrationParams {
  email: string;
  password: string;
}

export class EmailRegistrationStrategy {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(params: EmailRegistrationParams): Promise<User> {
    const email = Email.create(params.email);
    const password = Password.create(params.password);

    const existing = await this.userRepository.findByEmail(email.toString());
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const passwordHash = await this.passwordService.hash(password.toString());

    const user = User.create({
      email: email.toString(),
      passwordHash,
      registrationMethod: 'EMAIL',
    });

    return this.userRepository.save(user);
  }
}
