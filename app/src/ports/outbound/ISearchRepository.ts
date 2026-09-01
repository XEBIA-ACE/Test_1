import { Product } from '../../domain/entities/Product';
import { ProductResponseDto } from '../../application/dto/ProductResponseDto';
import { CategoryFilters } from '../inbound/ISearchService';

export interface SearchResult {
  items: ProductResponseDto[];
  total: number;
}

export interface ISearchRepository {
  indexProduct(product: Product): Promise<void>;
  removeProduct(productId: string): Promise<void>;
  search(query: string, page: number, size: number): Promise<SearchResult>;
  browseByCategory(slug: string, filters: CategoryFilters, page: number, size: number): Promise<SearchResult>;
}
