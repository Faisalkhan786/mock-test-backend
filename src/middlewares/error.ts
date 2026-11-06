import { Request, Response, NextFunction } from "express";

// Wrap async route handlers so thrown errors reach the error middleware
// instead of crashing the process.
export const wrap =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const status = err instanceof AppError ? err.status : 500;
  if (status === 500) console.error(err);
  res.status(status).json({ error: err.message || "Server error" });
}
