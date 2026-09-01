import { Product } from '../../domain/entities/Product';
import { CreateProductDto } from '../../application/dto/CreateProductDto';
import { UpdateProductDto } from '../../application/dto/UpdateProductDto';

export interface IProductService {
  createProduct(dto: CreateProductDto): Promise<Product>;
  getProductById(id: string): Promise<Product>;
  updateProduct(id: string, dto: UpdateProductDto): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  listProducts(page: number, size: number): Promise<{ items: Product[]; total: number }>;
}
