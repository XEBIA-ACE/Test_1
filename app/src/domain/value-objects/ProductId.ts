import { v4 as uuidv4, validate as uuidValidate } from 'uuid';

export class ProductId {
  private readonly value: string;

  constructor(value?: string) {
    const id = value ?? uuidv4();
    if (!uuidValidate(id)) {
      throw new Error(`Invalid ProductId: ${id}`);
    }
    this.value = id;
  }

  toString(): string {
    return this.value;
  }

  equals(other: ProductId): boolean {
    return this.value === other.value;
  }
}
