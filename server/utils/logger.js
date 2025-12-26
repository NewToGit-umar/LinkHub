/**
 * Logger Utility
 * Simple logging utility for the application
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const logLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
  SUCCESS: 'SUCCESS'
};

class Logger {
  constructor() {
    this.level = process.env.LOG_LEVEL || 'INFO';
  }

  timestamp() {
    return new Date().toISOString();
  }

  log(level, message, data = null) {
    const timestamp = this.timestamp();
    const prefix = `[${timestamp}] [${level}]`;
    
    let coloredPrefix = prefix;
    switch (level) {
      case logLevels.ERROR:
        coloredPrefix = `${colors.red}${prefix}${colors.reset}`;
        break;
      case logLevels.WARN:
        coloredPrefix = `${colors.yellow}${prefix}${colors.reset}`;
        break;
      case logLevels.SUCCESS:
        coloredPrefix = `${colors.green}${prefix}${colors.reset}`;
        break;
      case logLevels.DEBUG:
        coloredPrefix = `${colors.cyan}${prefix}${colors.reset}`;
        break;
      case logLevels.INFO:
      default:
        coloredPrefix = `${colors.blue}${prefix}${colors.reset}`;
    }

    console.log(`${coloredPrefix} ${message}`);
    if (data && process.env.NODE_ENV === 'development') {
      console.log(data);
    }
  }

  error(message, data = null) {
    this.log(logLevels.ERROR, message, data);
  }

  warn(message, data = null) {
    this.log(logLevels.WARN, message, data);
  }

  info(message, data = null) {
    this.log(logLevels.INFO, message, data);
  }

  debug(message, data = null) {
    if (process.env.NODE_ENV === 'development') {
      this.log(logLevels.DEBUG, message, data);
    }
  }

  success(message, data = null) {
    this.log(logLevels.SUCCESS, message, data);
  }
}

module.exports = new Logger();
