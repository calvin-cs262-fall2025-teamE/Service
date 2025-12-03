import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev');

    // 🔥 Type narrowing: decoded can be a string or JwtPayload
    if (typeof decoded === 'string') {
      return res.status(401).json({ error: 'Unauthorized: Invalid token payload' });
    }

    // decoded is now a JwtPayload
    if (!decoded.sub) {
      return res.status(401).json({ error: 'Unauthorized: Missing token subject' });
    }

    req.userId = Number(decoded.sub);

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};
