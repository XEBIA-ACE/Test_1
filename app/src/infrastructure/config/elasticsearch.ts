import { Client } from '@elastic/elasticsearch';
import { config } from './config';

export const elasticsearchClient = new Client({
  node: config.elasticsearch.node,
  auth: {
    username: config.elasticsearch.username,
    password: config.elasticsearch.password,
  },
});

export async function initElasticsearch(): Promise<void> {
  const indexName = config.elasticsearch.indexProducts;
  const exists = await elasticsearchClient.indices.exists({ index: indexName });
  if (!exists) {
    await elasticsearchClient.indices.create({
      index: indexName,
      mappings: {
        properties: {
          id: { type: 'keyword' },
          name: { type: 'text', analyzer: 'standard' },
          description: { type: 'text', analyzer: 'standard' },
          price: { type: 'double' },
          currency: { type: 'keyword' },
          categoryId: { type: 'keyword' },
          categorySlug: { type: 'keyword' },
          rating: { type: 'float' },
          reviewCount: { type: 'integer' },
          stockStatus: { type: 'keyword' },
          thumbnailUrl: { type: 'keyword' },
          tags: { type: 'keyword' },
          isActive: { type: 'boolean' },
          updatedAt: { type: 'date' },
        },
      },
    });
  }
}
