import express, { Request, Response } from 'express';
import { logger } from './logger';

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req: Request, res: Response) => {
  logger.info('Received request to root endpoint', {
    path: req.path,
    method: req.method,
    ip: req.ip,
  });
  res.json({ message: 'Hello from Cloud Run!' });
});

app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check requested', {
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
  res.json({ status: 'OK' });
});

// エラーテスト用エンドポイント
app.get('/error', (req: Request, res: Response) => {
  logger.warning('Attempting to trigger a test error', {
    path: req.path,
    method: req.method,
  });

  // 意図的にエラーを発生させる
  throw new Error('This is a test error for Error Reporting');
});

// エラーハンドリングの例
app.use((err: Error, req: Request, res: Response, next: any) => {
  logger.error('An error occurred', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  logger.info('Server started', {
    port,
    environment: process.env.NODE_ENV || 'development',
  });
});