import { Product } from '../../domain/entities/Product';

export interface IProductRepository {
  save(product: Product): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findAll(page: number, size: number): Promise<{ items: Product[]; total: number }>;
  update(product: Product): Promise<Product>;
  delete(id: string): Promise<void>;
}
