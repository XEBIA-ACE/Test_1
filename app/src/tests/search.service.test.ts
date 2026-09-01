import { SearchService } from '../application/services/SearchService';
import { ISearchRepository } from '../ports/outbound/ISearchRepository';
import { ICacheRepository } from '../ports/outbound/ICacheRepository';
import { StockStatus } from '../domain/entities/Product';
import { ProductResponseDto } from '../application/dto/ProductResponseDto';

const makeProductResponse = (): ProductResponseDto => ({
  id: 'test-uuid-1234-5678-abcd-ef0123456789',
  name: 'Test Product',
  price: 29.99,
  currency: 'USD',
  rating: 4.5,
  reviewCount: 100,
  stockStatus: StockStatus.IN_STOCK,
  categoryId: 'cat-uuid-1234-5678-abcd-ef0123456789',
  categorySlug: 'electronics',
  thumbnailUrl: 'https://example.com/thumb.jpg',
  tags: ['electronics'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

describe('SearchService', () => {
  let searchService: SearchService;
  let mockSearchRepository: jest.Mocked<ISearchRepository>;
  let mockCacheRepository: jest.Mocked<ICacheRepository>;

  beforeEach(() => {
    mockSearchRepository = {
      indexProduct: jest.fn(),
      removeProduct: jest.fn(),
      search: jest.fn(),
      browseByCategory: jest.fn(),
    };
    mockCacheRepository = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      delByPattern: jest.fn(),
    };

    searchService = new SearchService(mockSearchRepository, mockCacheRepository);
  });

  describe('search', () => {
    it('should return cached results if available', async () => {
      const cachedResult = { items: [makeProductResponse()], total: 1 };
      mockCacheRepository.get.mockResolvedValue(cachedResult);

      const result = await searchService.search({ q: 'laptop', page: 1, size: 20 });

      expect(mockCacheRepository.get).toHaveBeenCalled();
      expect(mockSearchRepository.search).not.toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should query Elasticsearch and cache results on cache miss', async () => {
      const searchResult = { items: [makeProductResponse()], total: 1 };
      mockCacheRepository.get.mockResolvedValue(null);
      mockSearchRepository.search.mockResolvedValue(searchResult);
      mockCacheRepository.set.mockResolvedValue(undefined);

      const result = await searchService.search({ q: 'laptop', page: 1, size: 20 });

      expect(mockSearchRepository.search).toHaveBeenCalledWith('laptop', 1, 20);
      expect(mockCacheRepository.set).toHaveBeenCalled();
      expect(result.items).toHaveLength(1);
    });

    it('should use default pagination when not provided', async () => {
      mockCacheRepository.get.mockResolvedValue(null);
      mockSearchRepository.search.mockResolvedValue({ items: [], total: 0 });
      mockCacheRepository.set.mockResolvedValue(undefined);

      const result = await searchService.search({ q: 'test' });

      expect(result.page).toBe(1);
      expect(result.size).toBe(20);
    });
  });

  describe('browseByCategory', () => {
    it('should return cached category results if available', async () => {
      const cachedResult = { items: [makeProductResponse()], total: 1 };
      mockCacheRepository.get.mockResolvedValue(cachedResult);

      const result = await searchService.browseByCategory('electronics', {}, 1, 20);

      expect(mockCacheRepository.get).toHaveBeenCalled();
      expect(mockSearchRepository.browseByCategory).not.toHaveBeenCalled();
      expect(result.total).toBe(1);
    });

    it('should query Elasticsearch on cache miss', async () => {
      const searchResult = { items: [makeProductResponse()], total: 1 };
      mockCacheRepository.get.mockResolvedValue(null);
      mockSearchRepository.browseByCategory.mockResolvedValue(searchResult);
      mockCacheRepository.set.mockResolvedValue(undefined);

      const result = await searchService.browseByCategory('electronics', { inStock: true }, 1, 20);

      expect(mockSearchRepository.browseByCategory).toHaveBeenCalledWith('electronics', { inStock: true }, 1, 20);
      expect(result.total).toBe(1);
    });
  });
});
