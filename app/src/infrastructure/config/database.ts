import { DataSource } from 'typeorm';
import { config } from './config';
import { ProductEntity } from '../../adapters/outbound/postgres/entities/ProductEntity';
import { CategoryEntity } from '../../adapters/outbound/postgres/entities/CategoryEntity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: config.db.pgBouncerHost,
  port: config.db.pgBouncerPort,
  username: config.db.user,
  password: config.db.password,
  database: config.db.name,
  entities: [ProductEntity, CategoryEntity],
  synchronize: config.app.nodeEnv === 'development',
  logging: config.app.nodeEnv === 'development',
  poolSize: config.db.poolMax,
  extra: {
    min: config.db.poolMin,
    max: config.db.poolMax,
  },
});

export async function initDatabase(): Promise<void> {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
}
