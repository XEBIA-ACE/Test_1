import { Router } from 'express';
import { ProductController } from '../ProductController';
import { IProductService } from '../../../../ports/inbound/IProductService';
import { authMiddleware } from '../middleware/authMiddleware';

export function createProductRouter(productService: IProductService): Router {
  const router = Router();
  const controller = new ProductController(productService);

  router.post('/', authMiddleware(['admin']), (req, res, next) => controller.create(req, res, next));
  router.get('/', (req, res, next) => controller.list(req, res, next));
  router.get('/:id', (req, res, next) => controller.getById(req, res, next));
  router.put('/:id', authMiddleware(['admin']), (req, res, next) => controller.update(req, res, next));
  router.delete('/:id', authMiddleware(['admin']), (req, res, next) => controller.delete(req, res, next));

  return router;
}
