import {
  Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { StockStatus } from '../../../../domain/entities/Product';

@Entity('products')
export class ProductEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column('text')
  description!: string;

  @Column('decimal', { precision: 12, scale: 2 })
  price!: number;

  @Column({ length: 3 })
  currency!: string;

  @Column('uuid', { name: 'category_id' })
  categoryId!: string;

  @Column({ name: 'category_slug', length: 100 })
  categorySlug!: string;

  @Column('decimal', { precision: 3, scale: 2, default: 0 })
  rating!: number;

  @Column('int', { name: 'review_count', default: 0 })
  reviewCount!: number;

  @Column({ type: 'enum', enum: StockStatus, name: 'stock_status' })
  stockStatus!: StockStatus;

  @Column('int', { name: 'stock_quantity', default: 0 })
  stockQuantity!: number;

  @Column({ name: 'thumbnail_url', length: 500 })
  thumbnailUrl!: string;

  @Column('simple-array', { name: 'image_urls', default: '' })
  imageUrls!: string[];

  @Column('simple-array', { default: '' })
  tags!: string[];

  @Column('jsonb', { default: '{}' })
  attributes!: Record<string, string>;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
