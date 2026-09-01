import { v4 as uuidv4 } from 'uuid';

export enum StockStatus {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  LOW_STOCK = 'LOW_STOCK',
}

export interface ProductProps {
  id?: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  stockQuantity: number;
  thumbnailUrl: string;
  imageUrls: string[];
  tags: string[];
  attributes: Record<string, string>;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  readonly id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  stockStatus: StockStatus;
  stockQuantity: number;
  thumbnailUrl: string;
  imageUrls: string[];
  tags: string[];
  attributes: Record<string, string>;
  isActive: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: ProductProps) {
    this.id = props.id ?? uuidv4();
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.currency = props.currency;
    this.categoryId = props.categoryId;
    this.categorySlug = props.categorySlug;
    this.rating = props.rating;
    this.reviewCount = props.reviewCount;
    this.stockStatus = props.stockStatus;
    this.stockQuantity = props.stockQuantity;
    this.thumbnailUrl = props.thumbnailUrl;
    this.imageUrls = props.imageUrls;
    this.tags = props.tags;
    this.attributes = props.attributes;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }

  update(updates: Partial<Omit<ProductProps, 'id' | 'createdAt'>>): void {
    Object.assign(this, updates);
    this.updatedAt = new Date();
  }

  deactivate(): void {
    this.isActive = false;
    this.updatedAt = new Date();
  }
}
