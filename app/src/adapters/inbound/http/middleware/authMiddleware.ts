import { Request, Response, NextFunction } from 'express';

export function authMiddleware(requiredRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const rolesHeader = req.headers['x-user-roles'] as string | undefined;
    if (!rolesHeader) {
      res.status(401).json({ error: 'Unauthorized: missing roles header' });
      return;
    }
    const userRoles = rolesHeader.split(',').map((r) => r.trim());
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      res.status(403).json({ error: 'Forbidden: insufficient permissions' });
      return;
    }
    next();
  };
}
