type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  data?: any;
  context?: Record<string, any>;
  userId?: string;
  requestId?: string;
  statusCode?: number;
  duration?: number;
}

interface LoggerConfig {
  minLevel: LogLevel;
  sentryEnabled?: boolean;
  consoleEnabled?: boolean;
}

class Logger {
  private static instance: Logger;
  private config: LoggerConfig = {
    minLevel: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
    sentryEnabled: process.env.NODE_ENV === 'production',
    consoleEnabled: true
  };

  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  private shouldLog(level: LogLevel): boolean {
    return this.LOG_LEVELS[level] >= this.LOG_LEVELS[this.config.minLevel];
  }
  private isDevelopment = process.env.NODE_ENV !== 'production';

  private formatMessage(entry: LogEntry): string {
    const context = entry.context ? `\nContext: ${JSON.stringify(entry.context, null, 2)}` : '';
    const data = entry.data ? `\nData: ${JSON.stringify(entry.data, null, 2)}` : '';
    
    return `[${entry.timestamp}] ${entry.level.toUpperCase()}: ${entry.message}${context}${data}`;
  }

  private enrichContext(context?: Record<string, any>): Record<string, any> {
    return {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.APP_VERSION,
      ...this.getRequestContext(),
      ...context
    };
  }

  private sanitizeData(data: any): any {
    if (!data) return data;
    
    const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'credentials', 'email', 'phone', 'ssn'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = Array.isArray(data) ? [...data] : { ...data };
      
      for (const key in sanitized) {
        if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = this.sanitizeData(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  private getRequestContext(): Record<string, any> {
    if (typeof window !== 'undefined') {
      return {
        url: window.location.href,
        userAgent: window.navigator.userAgent,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
    }
    return {};
  }

  private log(level: LogLevel, message: string, data?: any, context?: Record<string, any>) {
    if (!this.shouldLog(level)) return;

    const enrichedContext = this.enrichContext(context);
    const sanitizedData = this.sanitizeData(data);
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data: sanitizedData,
      context: enrichedContext
    };

    // Console logging if enabled (structured JSON format)
    if (this.config.consoleEnabled) {
      console.log(JSON.stringify({
        timestamp: entry.timestamp,
        level: entry.level,
        message: entry.message,
        data: sanitizedData,
        context: enrichedContext
      }));
    }

    // Send errors to error reporting service in production
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      const errorData = data instanceof Error ? {
        name: data.name,
        message: data.message,
        stack: data.stack
      } : data;

      const errorContext = {
        ...enrichedContext,
        errorData
      };

      // Log to console in structured format for aggregation
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        context: errorContext
      }));
    }
  }

  public setConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config };
  }

  public debug(message: string, data?: any, context?: Record<string, any>) {
    this.log('debug', message, data, context);
  }

  public info(message: string, data?: any, context?: Record<string, any>) {
    this.log('info', message, data, context);
  }

  public warn(message: string, data?: any, context?: Record<string, any>) {
    this.log('warn', message, data, context);
  }

  public error(message: string, error?: Error | unknown, context?: Record<string, any>) {
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error as any)
    } : error;

    this.log('error', message, errorDetails, context);
  }

  /**
   * Log API request/response
   */
  public apiRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ) {
    this.log('info', `${method} ${path}`, {
      statusCode,
      durationMs: duration,
      userId,
      method,
      path,
    });
  }

  /**
   * Log authentication event
   */
  public authEvent(event: 'login_attempt' | 'login_success' | 'login_failed' | 'logout' | 'account_locked', userId?: string, context?: Record<string, any>) {
    this.log('info', `Auth: ${event}`, { event, userId }, context);
  }

  /**
   * Log security event
   */
  public securityEvent(
    event: 'rate_limit_exceeded' | 'invalid_token' | 'unauthorized_access' | 'account_locked',
    context?: Record<string, any>
  ) {
    this.log('warn', `Security: ${event}`, { event }, context);
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }
}

export const logger = new Logger();
