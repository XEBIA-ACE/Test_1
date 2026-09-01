import { StockStatus } from '../../domain/entities/Product';

export interface ProductResponseDto {
  id: string;
  name: string;
  price: number;
  currency: string;
  rating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  categoryId: string;
  categorySlug: string;
  thumbnailUrl: string;
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
