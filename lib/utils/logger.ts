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

    // Em produção, envia logs para serviço externo se configurado
    if (!this.isDevelopment) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry) {
    try {
      // Sentry: capturar erros (se configurado)
      if (entry.level === 'error' && typeof window !== 'undefined') {
        // No cliente, Sentry pode estar disponível globalmente
        if ((window as any).Sentry) {
          if (entry.error) {
            (window as any).Sentry.captureException(entry.error, {
              extra: entry.metadata,
              level: entry.level,
            });
          } else {
            (window as any).Sentry.captureMessage(entry.message, {
              extra: entry.metadata,
              level: entry.level,
            });
          }
        }
      }

      // Para server-side logging, poderia enviar para:
      // - Sentry (server-side)
      // - LogRocket
      // - Datadog
      // - CloudWatch
      // - Custom endpoint

      // Exemplo de envio para endpoint custom (desabilitado por padrão)
      if (process.env.LOGGING_ENDPOINT && (entry.level === 'error' || entry.level === 'warn')) {
        fetch(process.env.LOGGING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...entry,
            timestamp: entry.timestamp.toISOString(),
            error: entry.error ? {
              message: entry.error.message,
              stack: entry.error.stack,
              name: entry.error.name,
            } : undefined,
          }),
        }).catch(() => {
          // Falha silenciosa - não queremos quebrar app por erro de logging
        });
      }
    } catch (error) {
      // Falha silenciosa - logging não deve quebrar a aplicação
      console.error('Logger: Falha ao enviar para serviço externo', error);
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
