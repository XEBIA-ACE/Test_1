import { v4 as uuidv4 } from 'uuid';

export interface CategoryProps {
  id?: string;
  name: string;
  slug: string;
  parentId?: string | null;
  description?: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Category {
  readonly id: string;
  name: string;
  slug: string;
  parentId: string | null;
  description: string;
  isActive: boolean;
  readonly createdAt: Date;
  updatedAt: Date;

  constructor(props: CategoryProps) {
    this.id = props.id ?? uuidv4();
    this.name = props.name;
    this.slug = props.slug;
    this.parentId = props.parentId ?? null;
    this.description = props.description ?? '';
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? new Date();
  }
}
