import { Request, Response, NextFunction } from 'express';

export default function logRequest(req: Request, res: Response, next: NextFunction) {
  console.log('--- New Request ---');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('User IP:', req.header('x-forwarded-for'));
  next();
}