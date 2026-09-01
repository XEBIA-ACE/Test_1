import request from 'supertest';
import { createApp } from '../app';
import { IProductService } from '../ports/inbound/IProductService';
import { ISearchService } from '../ports/inbound/ISearchService';

const mockProductService: IProductService = {
  createProduct: jest.fn(),
  getProductById: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  listProducts: jest.fn(),
};

const mockSearchService: ISearchService = {
  search: jest.fn(),
  browseByCategory: jest.fn(),
};

const app = createApp({ productService: mockProductService, searchService: mockSearchService });

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeDefined();
    });
  });

  describe('GET /health/ready', () => {
    it('should return 200 with status ready', async () => {
      const res = await request(app).get('/health/ready');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ready');
      expect(res.body.timestamp).toBeDefined();
    });
  });
});
