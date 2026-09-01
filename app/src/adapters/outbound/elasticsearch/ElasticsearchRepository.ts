import { Client } from '@elastic/elasticsearch';
import { ISearchRepository, SearchResult } from '../../../ports/outbound/ISearchRepository';
import { Product } from '../../../domain/entities/Product';
import { CategoryFilters } from '../../../ports/inbound/ISearchService';
import { ProductResponseDto } from '../../../application/dto/ProductResponseDto';

export class ElasticsearchRepository implements ISearchRepository {
  constructor(
    private readonly client: Client,
    private readonly index: string,
  ) {}

  async indexProduct(product: Product): Promise<void> {
    await this.client.index({
      index: this.index,
      id: product.id,
      document: {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        currency: product.currency,
        categoryId: product.categoryId,
        categorySlug: product.categorySlug,
        rating: product.rating,
        reviewCount: product.reviewCount,
        stockStatus: product.stockStatus,
        thumbnailUrl: product.thumbnailUrl,
        tags: product.tags,
        isActive: product.isActive,
        updatedAt: product.updatedAt.toISOString(),
      },
    });
  }

  async removeProduct(productId: string): Promise<void> {
    await this.client.delete({ index: this.index, id: productId });
  }

  async search(query: string, page: number, size: number): Promise<SearchResult> {
    const from = (page - 1) * size;
    const response = await this.client.search({
      index: this.index,
      from,
      size,
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['name^3', 'description', 'tags^2'],
                type: 'best_fields',
              },
            },
          ],
          filter: [{ term: { isActive: true } }],
        },
      },
    });

    return this.mapResponse(response);
  }

  async browseByCategory(slug: string, filters: CategoryFilters, page: number, size: number): Promise<SearchResult> {
    const from = (page - 1) * size;
    const filterClauses: object[] = [
      { term: { categorySlug: slug } },
      { term: { isActive: true } },
    ];

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      filterClauses.push({ range: { price: { gte: filters.minPrice, lte: filters.maxPrice } } });
    }
    if (filters.minRating !== undefined) {
      filterClauses.push({ range: { rating: { gte: filters.minRating } } });
    }
    if (filters.inStock) {
      filterClauses.push({ term: { stockStatus: 'IN_STOCK' } });
    }

    const response = await this.client.search({
      index: this.index,
      from,
      size,
      query: { bool: { filter: filterClauses } },
      sort: [{ rating: { order: 'desc' } }],
    });

    return this.mapResponse(response);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private mapResponse(response: any): SearchResult {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const hits = response.hits.hits as any[];
    const total = typeof response.hits.total === 'number'
      ? response.hits.total
      : response.hits.total?.value ?? 0;

    const items: ProductResponseDto[] = hits.map((hit) => ({
      id: hit._source.id,
      name: hit._source.name,
      price: hit._source.price,
      currency: hit._source.currency,
      rating: hit._source.rating,
      reviewCount: hit._source.reviewCount,
      stockStatus: hit._source.stockStatus,
      categoryId: hit._source.categoryId,
      categorySlug: hit._source.categorySlug,
      thumbnailUrl: hit._source.thumbnailUrl,
      tags: hit._source.tags,
      isActive: hit._source.isActive,
      createdAt: hit._source.createdAt ?? '',
      updatedAt: hit._source.updatedAt ?? '',
    }));

    return { items, total };
  }
}
