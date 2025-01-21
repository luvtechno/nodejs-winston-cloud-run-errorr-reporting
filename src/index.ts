import express, { Request, Response } from 'express';
import { logger } from './logger';
import { generateTestError } from './error-generator';

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

  generateTestError();
});

app.get('/error2', (req: Request, res: Response) => {
  logger.warning('Attempting to trigger a test error', {
    path: req.path,
    method: req.method,
  });

  generateTestError();
});

// エラーハンドリングの例
app.use((err: Error, req: Request, res: Response, next: any) => {
  const message = `[${req.method} ${req.url}] ${err.message}`;
  logger.error(message, {
    stack_trace: err.stack || 'No stack trace available',
    context: {
      httpRequest: {
        method: req.method,
        url: req.url,
        userAgent: req.get('user-agent') || '',
        referrer: req.get('referrer') || '',
        responseStatusCode: 500,
        remoteIp: req.ip
      },
      user: req.get('x-user-id') || 'anonymous',
      reportLocation: {
        filePath: err.stack ? err.stack.split('\n')[1].match(/(.*?):\d+/)?.[1] || 'unknown' : 'unknown',
        lineNumber: err.stack ? parseInt(err.stack.split('\n')[1].match(/\d+/)?.[0] || '0') : 0,
        functionName: err.stack ? (err.stack.split('\n')[1].match(/at\s+([^\s]+)/)?.[1] || 'unknown') : 'unknown'
      }
    }
  });
  res.status(500).json({ error: 'Internal Server Error' });
});

app.listen(port, () => {
  logger.info('Server started', {
    port,
    environment: process.env.NODE_ENV || 'development',
  });
});