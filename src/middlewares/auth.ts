import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";

export interface AuthedRequest extends Request {
  userId?: number;
}

// Verifies the JWT on every protected route. Keeps the API stateless —
// no server-side session, so any node in the cluster can serve any request.
export function auth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token missing" });
  }
  try {
    const payload = jwt.verify(header.slice(7), env.jwt.secret) as { uid: number };
    req.userId = payload.uid;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function signToken(userId: number): string {
  return jwt.sign({ uid: userId }, env.jwt.secret, { expiresIn: env.jwt.expiresIn as any });
}
