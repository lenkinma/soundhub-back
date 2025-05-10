import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwtUtils";

export function optionalAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.header("Authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "");
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (err) {
      // Если токен невалидный, не добавляем req.user, но и не блокируем запрос
      req.user = undefined;
    }
  }
  next();
}
