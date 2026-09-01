import CircuitBreaker from 'opossum';
import { ISearchRepository, SearchResult } from '../../ports/outbound/ISearchRepository';
import { ICacheRepository } from '../../ports/outbound/ICacheRepository';
import { Product } from '../../domain/entities/Product';
import { CategoryFilters } from '../../ports/inbound/ISearchService';
import { config } from '../config/config';

export class ElasticsearchCircuitBreaker implements ISearchRepository {
  private readonly searchBreaker: CircuitBreaker;
  private readonly browseBreaker: CircuitBreaker;

  constructor(
    private readonly searchRepository: ISearchRepository,
    private readonly cacheRepository: ICacheRepository,
  ) {
    const options = {
      timeout: config.circuitBreaker.timeoutMs,
      errorThresholdPercentage: config.circuitBreaker.errorThresholdPercentage,
      resetTimeout: config.circuitBreaker.resetTimeoutMs,
    };

    this.searchBreaker = new CircuitBreaker(
      (query: string, page: number, size: number) =>
        this.searchRepository.search(query, page, size),
      options,
    );

    this.browseBreaker = new CircuitBreaker(
      (slug: string, filters: CategoryFilters, page: number, size: number) =>
        this.searchRepository.browseByCategory(slug, filters, page, size),
      options,
    );
  }

  async indexProduct(product: Product): Promise<void> {
    return this.searchRepository.indexProduct(product);
  }

  async removeProduct(productId: string): Promise<void> {
    return this.searchRepository.removeProduct(productId);
  }

  async search(query: string, page: number, size: number): Promise<SearchResult> {
    try {
      return await this.searchBreaker.fire(query, page, size) as SearchResult;
    } catch {
      const cacheKey = `search:fallback:${query}:${page}:${size}`;
      const cached = await this.cacheRepository.get<SearchResult>(cacheKey);
      return cached ?? { items: [], total: 0 };
    }
  }

  async browseByCategory(slug: string, filters: CategoryFilters, page: number, size: number): Promise<SearchResult> {
    try {
      return await this.browseBreaker.fire(slug, filters, page, size) as SearchResult;
    } catch {
      const cacheKey = `category:fallback:${slug}:${page}:${size}`;
      const cached = await this.cacheRepository.get<SearchResult>(cacheKey);
      return cached ?? { items: [], total: 0 };
    }
  }
}
