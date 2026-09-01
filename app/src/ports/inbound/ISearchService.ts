import { ProductResponseDto } from '../../application/dto/ProductResponseDto';
import { SearchQueryDto } from '../../application/dto/SearchQueryDto';

export interface ISearchService {
  search(query: SearchQueryDto): Promise<{ items: ProductResponseDto[]; total: number; page: number; size: number }>;
  browseByCategory(slug: string, filters: CategoryFilters, page: number, size: number): Promise<{ items: ProductResponseDto[]; total: number }>;
}

export interface CategoryFilters {
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
}
