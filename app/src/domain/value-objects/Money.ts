export class Money {
  private readonly amount: number;
  private readonly currency: string;

  constructor(amount: number, currency: string) {
    if (amount < 0) throw new Error('Money amount cannot be negative');
    if (!currency || currency.length !== 3) throw new Error('Currency must be a 3-letter ISO code');
    this.amount = Math.round(amount * 100) / 100;
    this.currency = currency.toUpperCase();
  }

  getAmount(): number { return this.amount; }
  getCurrency(): string { return this.currency; }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Cannot add different currencies');
    return new Money(this.amount + other.amount, this.currency);
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  toString(): string {
    return `${this.amount} ${this.currency}`;
  }
}
