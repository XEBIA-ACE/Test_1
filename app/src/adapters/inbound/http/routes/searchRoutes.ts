import { Router } from 'express';
import { SearchController } from '../SearchController';
import { ISearchService } from '../../../../ports/inbound/ISearchService';

export function createSearchRouter(searchService: ISearchService): Router {
  const router = Router();
  const controller = new SearchController(searchService);

  router.get('/', (req, res, next) => controller.search(req, res, next));
  router.get('/category/:slug', (req, res, next) => controller.browseByCategory(req, res, next));

  return router;
}
