import { ISearchService, CategoryFilters } from '../../ports/inbound/ISearchService';
import { ISearchRepository } from '../../ports/outbound/ISearchRepository';
import { ICacheRepository } from '../../ports/outbound/ICacheRepository';
import { ProductResponseDto } from '../dto/ProductResponseDto';
import { SearchQueryDto } from '../dto/SearchQueryDto';

export class SearchService implements ISearchService {
  constructor(
    private readonly searchRepository: ISearchRepository,
    private readonly cacheRepository: ICacheRepository,
  ) {}

  async search(query: SearchQueryDto): Promise<{ items: ProductResponseDto[]; total: number; page: number; size: number }> {
    const page = query.page ?? 1;
    const size = query.size ?? 20;
    const cacheKey = `search:${JSON.stringify(query)}`;

    const cached = await this.cacheRepository.get<{ items: ProductResponseDto[]; total: number }>(cacheKey);
    if (cached) return { ...cached, page, size };

    const result = await this.searchRepository.search(query.q, page, size);
    await this.cacheRepository.set(cacheKey, result, 60);
    return { ...result, page, size };
  }

  async browseByCategory(
    slug: string,
    filters: CategoryFilters,
    page: number,
    size: number,
  ): Promise<{ items: ProductResponseDto[]; total: number }> {
    const cacheKey = `category:${slug}:${JSON.stringify(filters)}:${page}:${size}`;
    const cached = await this.cacheRepository.get<{ items: ProductResponseDto[]; total: number }>(cacheKey);
    if (cached) return cached;

    const result = await this.searchRepository.browseByCategory(slug, filters, page, size);
    await this.cacheRepository.set(cacheKey, result, 120);
    return result;
  }
}
