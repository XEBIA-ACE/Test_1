import { RegisterUserCommand } from '../commands/RegisterUserCommand';
import { RegisterResult } from '../../domain/ports/inbound/IAuthCommandPort';
import { EmailRegistrationStrategy } from '../../domain/strategies/EmailRegistrationStrategy';
import { MobileRegistrationStrategy } from '../../domain/strategies/MobileRegistrationStrategy';
import { IOutboxRepository } from '../../domain/ports/outbound/IOutboxRepository';
import { OutboxEvent } from '../../domain/entities/OutboxEvent';

export class RegisterUserHandler {
  constructor(
    private readonly emailStrategy: EmailRegistrationStrategy,
    private readonly mobileStrategy: MobileRegistrationStrategy,
    private readonly outboxRepository: IOutboxRepository,
  ) {}

  async handle(command: RegisterUserCommand): Promise<RegisterResult> {
    if (command.method === 'EMAIL') {
      if (!command.email || !command.password) {
        throw new Error('Email and password are required for email registration');
      }

      const user = await this.emailStrategy.execute({
        email: command.email,
        password: command.password,
      });

      // Publish UserRegistered event
      const event = OutboxEvent.create(
        user.id,
        'User',
        'UserRegistered',
        { userId: user.id, email: user.email, method: 'EMAIL' },
      );
      await this.outboxRepository.save(event);

      return { userId: user.id, message: 'Registration successful. Please verify your email.' };
    }

    if (command.method === 'MOBILE') {
      if (!command.phoneNumber) {
        throw new Error('Phone number is required for mobile registration');
      }

      const { user } = await this.mobileStrategy.execute({
        phoneNumber: command.phoneNumber,
      });

      return { userId: user.id, message: 'OTP sent to your mobile number.' };
    }

    throw new Error(`Unsupported registration method: ${command.method}`);
  }
}
