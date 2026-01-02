/**
 * Logging utility
 * Centralized logging with different levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
  error?: Error;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>, error?: Error) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      metadata,
      error,
    };

    // In production, only log errors and warnings
    if (!this.isDevelopment && (level === 'debug' || level === 'info')) {
      return;
    }

    const logMethod = level === 'error' ? console.error : 
                     level === 'warn' ? console.warn :
                     level === 'info' ? console.info : 
                     console.debug;

    const prefix = `[${level.toUpperCase()}] [${entry.timestamp.toISOString()}]`;
    
    if (error) {
      logMethod(prefix, message, metadata, error);
    } else if (metadata) {
      logMethod(prefix, message, metadata);
    } else {
      logMethod(prefix, message);
    }

    // Send to Sentry in production if configured
    if (!this.isDevelopment && level === 'error' && process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Sentry integration is optional - only if DSN is configured
      // To enable: Install @sentry/nextjs and configure in sentry.client.config.ts
      // For now, errors are logged to console and can be monitored via Vercel logs
    }
  }

  debug(message: string, metadata?: Record<string, unknown>) {
    this.log('debug', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log('info', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log('warn', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>) {
    this.log('error', message, metadata, error);
  }
}

export const logger = new Logger();
