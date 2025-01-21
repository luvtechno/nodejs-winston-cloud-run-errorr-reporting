type Severity = 'INFO' | 'WARNING' | 'ERROR';

interface LogEntry {
  severity: Severity;
  message: string;
  timestamp: string;
  [key: string]: any;
}

function createLogEntry(severity: Severity, message: string, additionalData: object = {}): LogEntry {
  return {
    severity,
    message,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };
}

export const logger = {
  info: (message: string, additionalData: object = {}) => {
    console.log(JSON.stringify(createLogEntry('INFO', message, additionalData)));
  },

  warning: (message: string, additionalData: object = {}) => {
    console.log(JSON.stringify(createLogEntry('WARNING', message, additionalData)));
  },

  error: (message: string, additionalData: object = {}) => {
    console.log(JSON.stringify(createLogEntry('ERROR', message, additionalData)));
  },
};