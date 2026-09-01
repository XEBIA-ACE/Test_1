import { Request, Response } from 'express';

export class HealthController {
  health(_req: Request, res: Response): void {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  ready(_req: Request, res: Response): void {
    res.status(200).json({ status: 'ready', timestamp: new Date().toISOString() });
  }
}
