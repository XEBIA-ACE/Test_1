import { v4 as uuidv4 } from 'uuid';
import { Product } from '../../domain/entities/Product';
import { IProductService } from '../../ports/inbound/IProductService';
import { IProductRepository } from '../../ports/outbound/IProductRepository';
import { ISearchRepository } from '../../ports/outbound/ISearchRepository';
import { ICacheRepository } from '../../ports/outbound/ICacheRepository';
import { IEventPublisher } from '../../ports/outbound/IEventPublisher';
import { CreateProductDto } from '../dto/CreateProductDto';
import { UpdateProductDto } from '../dto/UpdateProductDto';
import { ProductNotFoundException } from '../../domain/exceptions/ProductNotFoundException';
import { CatalogEventType } from '../../domain/events/CatalogUpdatedEvent';

export class ProductService implements IProductService {
  constructor(
    private readonly productRepository: IProductRepository,
    private readonly searchRepository: ISearchRepository,
    private readonly cacheRepository: ICacheRepository,
    private readonly eventPublisher: IEventPublisher,
  ) {}

  async createProduct(dto: CreateProductDto): Promise<Product> {
    const product = new Product({
      name: dto.name,
      description: dto.description,
      price: dto.price,
      currency: dto.currency,
      categoryId: dto.categoryId,
      categorySlug: dto.categorySlug,
      rating: 0,
      reviewCount: 0,
      stockStatus: dto.stockStatus,
      stockQuantity: dto.stockQuantity,
      thumbnailUrl: dto.thumbnailUrl,
      imageUrls: dto.imageUrls ?? [],
      tags: dto.tags ?? [],
      attributes: dto.attributes ?? {},
      isActive: true,
    });

    const saved = await this.productRepository.save(product);

    await this.searchRepository.indexProduct(saved);
    await this.eventPublisher.publish({
      eventId: uuidv4(),
      eventType: CatalogEventType.PRODUCT_CREATED,
      productId: saved.id,
      timestamp: new Date().toISOString(),
      payload: { product: saved },
    });

    return saved;
  }

  async getProductById(id: string): Promise<Product> {
    const cacheKey = `product:${id}`;
    const cached = await this.cacheRepository.get<Product>(cacheKey);
    if (cached) return cached;

    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundException(id);

    await this.cacheRepository.set(cacheKey, product);
    return product;
  }

  async updateProduct(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundException(id);

    product.update(dto);
    const updated = await this.productRepository.update(product);

    await this.searchRepository.indexProduct(updated);
    await this.cacheRepository.del(`product:${id}`);
    await this.eventPublisher.publish({
      eventId: uuidv4(),
      eventType: CatalogEventType.PRODUCT_UPDATED,
      productId: updated.id,
      timestamp: new Date().toISOString(),
      payload: { product: updated },
    });

    return updated;
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundException(id);

    await this.productRepository.delete(id);
    await this.searchRepository.removeProduct(id);
    await this.cacheRepository.del(`product:${id}`);
    await this.eventPublisher.publish({
      eventId: uuidv4(),
      eventType: CatalogEventType.PRODUCT_DELETED,
      productId: id,
      timestamp: new Date().toISOString(),
      payload: { productId: id },
    });
  }

  async listProducts(page: number, size: number): Promise<{ items: Product[]; total: number }> {
    const cacheKey = `products:list:${page}:${size}`;
    const cached = await this.cacheRepository.get<{ items: Product[]; total: number }>(cacheKey);
    if (cached) return cached;

    const result = await this.productRepository.findAll(page, size);
    await this.cacheRepository.set(cacheKey, result);
    return result;
  }
}
