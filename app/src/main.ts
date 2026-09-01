import 'reflect-metadata';
import { createApp } from './app';
import { config } from './infrastructure/config/config';
import { initDatabase, AppDataSource } from './infrastructure/config/database';
import { initElasticsearch, elasticsearchClient } from './infrastructure/config/elasticsearch';
import { createRedisClient } from './infrastructure/config/redis';
import { createKafkaClient } from './infrastructure/config/kafka';
import { ProductRepository } from './adapters/outbound/postgres/ProductRepository';
import { ElasticsearchRepository } from './adapters/outbound/elasticsearch/ElasticsearchRepository';
import { RedisCacheRepository } from './adapters/outbound/redis/RedisCacheRepository';
import { KafkaEventPublisher } from './adapters/outbound/kafka/KafkaEventPublisher';
import { CatalogEventConsumer } from './adapters/inbound/kafka/CatalogEventConsumer';
import { ElasticsearchCircuitBreaker } from './infrastructure/circuit-breaker/ElasticsearchCircuitBreaker';
import { ProductService } from './application/services/ProductService';
import { SearchService } from './application/services/SearchService';

async function bootstrap(): Promise<void> {
  await initDatabase();
  await initElasticsearch();

  const redisClient = createRedisClient();
  await redisClient.connect();

  const kafkaClient = createKafkaClient();

  const productRepository = new ProductRepository(AppDataSource);
  const rawSearchRepository = new ElasticsearchRepository(
    elasticsearchClient,
    config.elasticsearch.indexProducts,
  );
  const cacheRepository = new RedisCacheRepository(redisClient, config.redis.ttlSeconds);
  const eventPublisher = new KafkaEventPublisher(kafkaClient, config.kafka.topicCatalogUpdated);

  const searchRepositoryWithCB = new ElasticsearchCircuitBreaker(rawSearchRepository, cacheRepository);

  const productService = new ProductService(
    productRepository,
    searchRepositoryWithCB,
    cacheRepository,
    eventPublisher,
  );
  const searchService = new SearchService(searchRepositoryWithCB, cacheRepository);

  const catalogConsumer = new CatalogEventConsumer(
    kafkaClient,
    config.kafka.topicCatalogUpdated,
    config.kafka.groupId,
    searchRepositoryWithCB,
    cacheRepository,
  );
  await catalogConsumer.start();

  const app = createApp({ productService, searchService });

  const server = app.listen(config.app.port, () => {
    console.log(`Product Service running on port ${config.app.port}`);
  });

  const shutdown = async (): Promise<void> => {
    console.log('Shutting down gracefully...');
    server.close(async () => {
      await catalogConsumer.stop();
      await eventPublisher.disconnect();
      await redisClient.quit();
      await AppDataSource.destroy();
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch((err) => {
  console.error('Failed to start service:', err);
  process.exit(1);
});
