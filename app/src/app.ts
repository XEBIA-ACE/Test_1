import 'reflect-metadata';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import morgan from 'morgan';
import { createHealthRouter } from './adapters/inbound/http/routes/healthRoutes';
import { createProductRouter } from './adapters/inbound/http/routes/productRoutes';
import { createSearchRouter } from './adapters/inbound/http/routes/searchRoutes';
import { errorMiddleware } from './adapters/inbound/http/middleware/errorMiddleware';
import { IProductService } from './ports/inbound/IProductService';
import { ISearchService } from './ports/inbound/ISearchService';

export interface AppDependencies {
  productService: IProductService;
  searchService: ISearchService;
}

export function createApp(deps: AppDependencies): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan('combined'));

  app.use('/health', createHealthRouter());
  app.use('/api/v1/products', createProductRouter(deps.productService));
  app.use('/api/v1/search', createSearchRouter(deps.searchService));

  app.use(errorMiddleware);

  return app;
}
