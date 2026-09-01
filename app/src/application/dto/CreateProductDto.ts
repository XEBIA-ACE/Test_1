import { StockStatus } from '../../domain/entities/Product';

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  categorySlug: string;
  stockStatus: StockStatus;
  stockQuantity: number;
  thumbnailUrl: string;
  imageUrls?: string[];
  tags?: string[];
  attributes?: Record<string, string>;
}
