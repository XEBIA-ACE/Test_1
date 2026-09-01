export class ProductNotFoundException extends Error {
  readonly statusCode = 404;
  constructor(productId: string) {
    super(`Product not found: ${productId}`);
    this.name = 'ProductNotFoundException';
  }
}
