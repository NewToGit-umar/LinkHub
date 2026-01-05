import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Log levels
const LOG_LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
}

// Current log level from env or default to 'info'
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL || 'info'] || 2

// Log directory
const LOG_DIR = path.join(__dirname, '../logs')

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true })
}

// Format timestamp
function getTimestamp() {
  return new Date().toISOString()
}

// Format log message
function formatMessage(level, message, meta = {}) {
  const timestamp = getTimestamp()
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`
}

// Write to file
function writeToFile(filename, message) {
  const filepath = path.join(LOG_DIR, filename)
  fs.appendFileSync(filepath, message + '\n')
}

// Get current date for daily log files
function getDateString() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

// Logger object
export const logger = {
  error: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.error) {
      const formatted = formatMessage('error', message, meta)
      console.error(formatted)
      writeToFile(`error-${getDateString()}.log`, formatted)
      writeToFile(`combined-${getDateString()}.log`, formatted)
    }
  },
  
  warn: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.warn) {
      const formatted = formatMessage('warn', message, meta)
      console.warn(formatted)
      writeToFile(`combined-${getDateString()}.log`, formatted)
    }
  },
  
  info: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.info) {
      const formatted = formatMessage('info', message, meta)
      console.log(formatted)
      writeToFile(`combined-${getDateString()}.log`, formatted)
    }
  },
  
  http: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.http) {
      const formatted = formatMessage('http', message, meta)
      console.log(formatted)
      writeToFile(`http-${getDateString()}.log`, formatted)
    }
  },
  
  debug: (message, meta = {}) => {
    if (currentLevel >= LOG_LEVELS.debug) {
      const formatted = formatMessage('debug', message, meta)
      console.log(formatted)
      writeToFile(`debug-${getDateString()}.log`, formatted)
    }
  }
}

// HTTP request logging middleware
export function requestLogger(req, res, next) {
  const startTime = Date.now()
  
  // Store original end function
  const originalEnd = res.end
  
  // Override end to capture response
  res.end = function(chunk, encoding) {
    res.end = originalEnd
    res.end(chunk, encoding)
    
    const duration = Date.now() - startTime
    const logData = {
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
      userAgent: req.get('user-agent'),
      userId: req.user?.id || 'anonymous'
    }
    
    // Log based on status code
    if (res.statusCode >= 500) {
      logger.error(`${req.method} ${req.originalUrl} ${res.statusCode}`, logData)
    } else if (res.statusCode >= 400) {
      logger.warn(`${req.method} ${req.originalUrl} ${res.statusCode}`, logData)
    } else {
      logger.http(`${req.method} ${req.originalUrl} ${res.statusCode}`, logData)
    }
  }
  
  next()
}

// Error logging middleware
export function errorLogger(err, req, res, next) {
  logger.error(err.message, {
    stack: err.stack,
    method: req.method,
    url: req.originalUrl || req.url,
    body: req.body,
    userId: req.user?.id
  })
  
  next(err)
}

// Audit logging for sensitive operations
export function auditLog(action, userId, details = {}) {
  const message = `AUDIT: ${action}`
  const meta = {
    userId,
    action,
    timestamp: getTimestamp(),
    ...details
  }
  
  const formatted = formatMessage('info', message, meta)
  writeToFile(`audit-${getDateString()}.log`, formatted)
  console.log(formatted)
}

export default logger
