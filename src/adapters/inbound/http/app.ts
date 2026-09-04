import express, { NextFunction, Request, Response } from 'express';
import path from 'node:path';
import { RegistrationService } from '../../../application/RegistrationService';
import { DomainError } from '../../../domain/errors';

export function createApp(registration: RegistrationService): express.Express {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '../../../../public')));

  app.get('/auth/registration-meta', async (_req, res, next) => {
    try {
      res.json(await registration.getRegistrationMeta());
    } catch (err) {
      next(err);
    }
  });

  app.post('/auth/register', async (req, res, next) => {
    try {
      res.status(201).json(await registration.register(req.body ?? {}));
    } catch (err) {
      next(err);
    }
  });

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof DomainError) {
      res.status(err.httpStatus).json({
        error_code: err.errorCode,
        message: err.message,
        ...(err.field ? { field: err.field } : {}),
      });
      return;
    }
    if (err instanceof SyntaxError) {
      res.status(400).json({ error_code: 'INVALID_JSON', message: 'Request body must be valid JSON.' });
      return;
    }
    console.error(err);
    res.status(500).json({
      error_code: 'INTERNAL_ERROR',
      message: 'Something went wrong on our side. Please try again later.',
    });
  });

  return app;
}
