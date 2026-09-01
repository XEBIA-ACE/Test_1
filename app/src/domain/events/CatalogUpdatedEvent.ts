export enum CatalogEventType {
  PRODUCT_CREATED = 'PRODUCT_CREATED',
  PRODUCT_UPDATED = 'PRODUCT_UPDATED',
  PRODUCT_DELETED = 'PRODUCT_DELETED',
}

export interface CatalogUpdatedEvent {
  eventId: string;
  eventType: CatalogEventType;
  productId: string;
  timestamp: string;
  payload: Record<string, unknown>;
}
