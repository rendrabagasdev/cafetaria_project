import chalk from "chalk";

/**
 * Centralized Logging Utility (Colored with Chalk)
 *
 * Provides structured error logging for production debugging
 * Logs include timestamp, context, and stack traces
 */

export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

export interface LogContext {
  service: string;
  action: string;
  [key: string]: any;
}

// Color mapping per log level
const levelColors = {
  [LogLevel.ERROR]: chalk.red.bold,
  [LogLevel.WARN]: chalk.yellow.bold,
  [LogLevel.INFO]: chalk.green.bold,
  [LogLevel.DEBUG]: chalk.cyan.bold,
};

const gray = chalk.gray;

/**
 * Structured error logger
 */
export function log(
  level: LogLevel,
  message: string,
  context: LogContext,
  error?: Error | any
): void {
  const timestamp = new Date().toISOString();

  const logEntry = {
    timestamp,
    level,
    message,
    context,
    environment: process.env.NODE_ENV || "development",
    ...(error && {
      error: {
        message: error.message,
        stack: error.stack,
        ...(error.response && {
          response: {
            status: error.response.status,
            data: error.response.data,
          },
        }),
      },
    }),
  };

  const color = levelColors[level];
  const label = color(`[${level}]`);
  const time = gray(timestamp);
  const env = chalk.magenta(logEntry.environment);

  const output = `
${time} ${label} ${chalk.white(message)} ${env}
${chalk.gray(JSON.stringify(logEntry, null, 2))}
`;

  switch (level) {
    case LogLevel.ERROR:
      console.error(output);
      break;
    case LogLevel.WARN:
      console.warn(output);
      break;
    case LogLevel.INFO:
      console.info(output);
      break;
    case LogLevel.DEBUG:
      console.debug(output);
      break;
  }
}

/**
 * Convenience functions for specific log levels
 */
export const logger = {
  error: (message: string, context: LogContext, error?: Error | any) =>
    log(LogLevel.ERROR, message, context, error),

  warn: (message: string, context: LogContext) =>
    log(LogLevel.WARN, message, context),

  info: (message: string, context: LogContext) =>
    log(LogLevel.INFO, message, context),

  debug: (message: string, context: LogContext) =>
    log(LogLevel.DEBUG, message, context),
};
