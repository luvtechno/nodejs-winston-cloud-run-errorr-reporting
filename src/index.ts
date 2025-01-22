import express, { Request, Response } from 'express';
import { logger } from './logger';
import { generateTestError, generateTestError2 } from './error-generator';

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req: Request, res: Response) => {
  logger.info('Received request to root endpoint', {
    httpRequest: {
      path: req.path,
      method: req.method
    }
  });
  res.json({ message: 'Hello from Cloud Run!' });
});

app.get('/health', (req: Request, res: Response) => {
  logger.info('Health check requested', {
    status: 'OK',
    httpRequest: {
      path: req.path,
      method: req.method
    }
  });
  res.json({ status: 'OK' });
});

// エラーテスト用エンドポイント
app.get('/error', (req: Request, res: Response) => {
  logger.warn('Attempting to trigger a test error', {
    httpRequest: {
      path: req.path,
      method: req.method
    }
  });

  generateTestError();
});

app.get('/error2', (req: Request, res: Response) => {
  logger.warn('Attempting to trigger a test error', {
    httpRequest: {
      path: req.path,
      method: req.method
    }
  });

  generateTestError2();
});

// エラーハンドリングの例
app.use((err: Error, req: Request, res: Response, next: any) => {
  const stackTraceFirstline = err.stack ? err.stack.split('\n')[1].match(/(.*?):\d+/)?.[1] || '' : ''; // e.g. "     at generateTestError (/app/dist/error-generator.js"
  const filePath = `${stackTraceFirstline.trimStart()})`; // e.g. "at generateTestError (/app/dist/error-generator.js)"
  const message = `[${req.method} ${req.url}] ${err.message} ${filePath}`;

  const originalStackTrace = (err.stack || 'No stack trace available').split('\n').slice(1).join('\n');
  const stackTrace = `${err.name}: ${message}\n${originalStackTrace}`;

  logger.error(message, {
    stack_trace: stackTrace,
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
        filePath: filePath,
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