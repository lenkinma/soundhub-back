import jwt from 'jsonwebtoken';
import { env } from './envConfig';

const JWT_SECRET = 'secreeet_tokeeeeeeeeeeeen';
const JWT_EXPIRES_IN = '6h';

export function generateToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function verifyToken(token: string): string | jwt.JwtPayload {
  return jwt.verify(token, JWT_SECRET);
}