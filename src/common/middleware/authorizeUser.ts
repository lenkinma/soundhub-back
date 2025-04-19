import { Request, Response, NextFunction } from 'express';
import { JwtUser } from '../types/jwtUser';

export function authorizeUser(req: Request, res: Response, next: NextFunction) {
  const userIdFromParams = Number.parseInt(req.params.id, 10);
  const user = req.user as JwtUser;

  if (user.id !== userIdFromParams) {
    return res.status(403).json({ message: 'You are not allowed to perform this action.' });
  }

  next();
}