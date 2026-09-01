export class ValidationException extends Error {
  readonly statusCode = 400;
  readonly errors: string[];
  constructor(errors: string[]) {
    super('Validation failed');
    this.name = 'ValidationException';
    this.errors = errors;
  }
}
