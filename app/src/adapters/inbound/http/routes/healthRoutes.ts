import { Router } from 'express';
import { HealthController } from '../HealthController';

export function createHealthRouter(): Router {
  const router = Router();
  const controller = new HealthController();

  router.get('/', (req, res) => controller.health(req, res));
  router.get('/ready', (req, res) => controller.ready(req, res));

  return router;
}
