import { ProductService } from '../application/services/ProductService';
import { IProductRepository } from '../ports/outbound/IProductRepository';
import { ISearchRepository } from '../ports/outbound/ISearchRepository';
import { ICacheRepository } from '../ports/outbound/ICacheRepository';
import { IEventPublisher } from '../ports/outbound/IEventPublisher';
import { Product, StockStatus } from '../domain/entities/Product';
import { ProductNotFoundException } from '../domain/exceptions/ProductNotFoundException';
import { CreateProductDto } from '../application/dto/CreateProductDto';

const makeProduct = (overrides = {}): Product =>
  new Product({
    id: 'test-uuid-1234-5678-abcd-ef0123456789',
    name: 'Test Product',
    description: 'A test product',
    price: 29.99,
    currency: 'USD',
    categoryId: 'cat-uuid-1234-5678-abcd-ef0123456789',
    categorySlug: 'electronics',
    rating: 4.5,
    reviewCount: 100,
    stockStatus: StockStatus.IN_STOCK,
    stockQuantity: 50,
    thumbnailUrl: 'https://example.com/thumb.jpg',
    imageUrls: [],
    tags: ['electronics'],
    attributes: {},
    isActive: true,
    ...overrides,
  });

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepository: jest.Mocked<IProductRepository>;
  let mockSearchRepository: jest.Mocked<ISearchRepository>;
  let mockCacheRepository: jest.Mocked<ICacheRepository>;
  let mockEventPublisher: jest.Mocked<IEventPublisher>;

  beforeEach(() => {
    mockProductRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
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
    mockEventPublisher = {
      publish: jest.fn(),
    };

    productService = new ProductService(
      mockProductRepository,
      mockSearchRepository,
      mockCacheRepository,
      mockEventPublisher,
    );
  });

  describe('createProduct', () => {
    it('should create a product and publish an event', async () => {
      const dto: CreateProductDto = {
        name: 'Test Product',
        description: 'A test product',
        price: 29.99,
        currency: 'USD',
        categoryId: 'cat-uuid-1234-5678-abcd-ef0123456789',
        categorySlug: 'electronics',
        stockStatus: StockStatus.IN_STOCK,
        stockQuantity: 50,
        thumbnailUrl: 'https://example.com/thumb.jpg',
      };

      const savedProduct = makeProduct();
      mockProductRepository.save.mockResolvedValue(savedProduct);
      mockSearchRepository.indexProduct.mockResolvedValue(undefined);
      mockEventPublisher.publish.mockResolvedValue(undefined);

      const result = await productService.createProduct(dto);

      expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
      expect(mockSearchRepository.indexProduct).toHaveBeenCalledWith(savedProduct);
      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
      expect(result).toEqual(savedProduct);
    });
  });

  describe('getProductById', () => {
    it('should return cached product if available', async () => {
      const product = makeProduct();
      mockCacheRepository.get.mockResolvedValue(product);

      const result = await productService.getProductById(product.id);

      expect(mockCacheRepository.get).toHaveBeenCalledWith(`product:${product.id}`);
      expect(mockProductRepository.findById).not.toHaveBeenCalled();
      expect(result).toEqual(product);
    });

    it('should fetch from DB and cache if not in cache', async () => {
      const product = makeProduct();
      mockCacheRepository.get.mockResolvedValue(null);
      mockProductRepository.findById.mockResolvedValue(product);
      mockCacheRepository.set.mockResolvedValue(undefined);

      const result = await productService.getProductById(product.id);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(product.id);
      expect(mockCacheRepository.set).toHaveBeenCalledWith(`product:${product.id}`, product);
      expect(result).toEqual(product);
    });

    it('should throw ProductNotFoundException if product not found', async () => {
      mockCacheRepository.get.mockResolvedValue(null);
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.getProductById('nonexistent-id')).rejects.toThrow(ProductNotFoundException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete product, remove from search index, and invalidate cache', async () => {
      const product = makeProduct();
      mockProductRepository.findById.mockResolvedValue(product);
      mockProductRepository.delete.mockResolvedValue(undefined);
      mockSearchRepository.removeProduct.mockResolvedValue(undefined);
      mockCacheRepository.del.mockResolvedValue(undefined);
      mockEventPublisher.publish.mockResolvedValue(undefined);

      await productService.deleteProduct(product.id);

      expect(mockProductRepository.delete).toHaveBeenCalledWith(product.id);
      expect(mockSearchRepository.removeProduct).toHaveBeenCalledWith(product.id);
      expect(mockCacheRepository.del).toHaveBeenCalledWith(`product:${product.id}`);
      expect(mockEventPublisher.publish).toHaveBeenCalledTimes(1);
    });

    it('should throw ProductNotFoundException if product does not exist', async () => {
      mockProductRepository.findById.mockResolvedValue(null);
      await expect(productService.deleteProduct('nonexistent-id')).rejects.toThrow(ProductNotFoundException);
    });
  });
});
