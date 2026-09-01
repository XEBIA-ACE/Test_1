export interface SearchQueryDto {
  q: string;
  page?: number;
  size?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  categorySlug?: string;
}
