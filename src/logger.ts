import winston from 'winston';

// Cloud Logging の severity レベルにマッピング
const levelToSeverity = winston.format((info) => {
  const severityMap: { [key: string]: string } = {
    error: 'ERROR',
    warn: 'WARNING',
    info: 'INFO',
    debug: 'DEBUG'
  };

  return {
    ...info,
    severity: severityMap[info.level] || 'DEFAULT'
  };
});

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    levelToSeverity(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
});

export { logger };