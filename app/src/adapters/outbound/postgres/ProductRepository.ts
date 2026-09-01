import { Repository, DataSource } from 'typeorm';
import { IProductRepository } from '../../../ports/outbound/IProductRepository';
import { Product } from '../../../domain/entities/Product';
import { ProductEntity } from './entities/ProductEntity';

export class ProductRepository implements IProductRepository {
  private readonly repo: Repository<ProductEntity>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(ProductEntity);
  }

  private toDomain(entity: ProductEntity): Product {
    return new Product({
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: Number(entity.price),
      currency: entity.currency,
      categoryId: entity.categoryId,
      categorySlug: entity.categorySlug,
      rating: Number(entity.rating),
      reviewCount: entity.reviewCount,
      stockStatus: entity.stockStatus,
      stockQuantity: entity.stockQuantity,
      thumbnailUrl: entity.thumbnailUrl,
      imageUrls: entity.imageUrls,
      tags: entity.tags,
      attributes: entity.attributes,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toEntity(product: Product): ProductEntity {
    const entity = new ProductEntity();
    Object.assign(entity, {
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
      stockQuantity: product.stockQuantity,
      thumbnailUrl: product.thumbnailUrl,
      imageUrls: product.imageUrls,
      tags: product.tags,
      attributes: product.attributes,
      isActive: product.isActive,
    });
    return entity;
  }

  async save(product: Product): Promise<Product> {
    const entity = this.toEntity(product);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: string): Promise<Product | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(page: number, size: number): Promise<{ items: Product[]; total: number }> {
    const [entities, total] = await this.repo.findAndCount({
      skip: (page - 1) * size,
      take: size,
      order: { createdAt: 'DESC' },
    });
    return { items: entities.map((e) => this.toDomain(e)), total };
  }

  async update(product: Product): Promise<Product> {
    const entity = this.toEntity(product);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
