const fs = require('fs');
const path = require('path');

// Buat direktori logs jika belum ada
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class WebhookLogger {
  constructor() {
    this.logFile = path.join(logsDir, 'webhook-tripay.log');
    this.runtimeFile = path.join(logsDir, 'runtime.log');
  }

  // Format timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Write to file dengan error handling
  writeToFile(filename, content) {
    try {
      fs.appendFileSync(filename, content + '\n', 'utf8');
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  // Log webhook events
  logWebhook(level, message, data = null) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };

    const logLine = `[${timestamp}] [${level.toUpperCase()}] ${message}${data ? ' | Data: ' + JSON.stringify(data) : ''}`;
    
    // Write to webhook log
    this.writeToFile(this.logFile, logLine);
    
    // Also console log
    console.log(logLine);
  }

  // Log runtime information
  logRuntime(action, details = {}) {
    const timestamp = this.getTimestamp();
    const runtimeEntry = {
      timestamp,
      action,
      details,
      memory: process.memoryUsage(),
      uptime: process.uptime()
    };

    const runtimeLine = `[${timestamp}] [RUNTIME] ${action} | ${JSON.stringify(details)} | Memory: ${Math.round(runtimeEntry.memory.heapUsed / 1024 / 1024)}MB`;
    
    // Write to runtime log
    this.writeToFile(this.runtimeFile, runtimeLine);
    
    // Console log for runtime
    console.log(runtimeLine);
  }

  // Log error dengan stack trace
  logError(error, context = '') {
    const timestamp = this.getTimestamp();
    const errorEntry = {
      timestamp,
      level: 'ERROR',
      context,
      name: error.name,
      message: error.message,
      stack: error.stack
    };

    const errorLine = `[${timestamp}] [ERROR] ${context} | ${error.name}: ${error.message}\nStack: ${error.stack}`;
    
    // Write to both logs
    this.writeToFile(this.logFile, errorLine);
    this.writeToFile(this.runtimeFile, errorLine);
    
    console.error(errorLine);
  }

  // Log request details
  logRequest(method, url, headers, body) {
    const requestData = {
      method,
      url,
      headers: Object.fromEntries(headers.entries()),
      bodySize: body ? body.length : 0,
      timestamp: this.getTimestamp()
    };

    this.logWebhook('INFO', 'Incoming Request', requestData);
  }

  // Log response details
  logResponse(statusCode, responseBody, processingTime) {
    const responseData = {
      statusCode,
      responseBody,
      processingTime: processingTime + 'ms',
      timestamp: this.getTimestamp()
    };

    this.logWebhook('INFO', 'Outgoing Response', responseData);
  }

  // Rotate log files jika terlalu besar (> 10MB)
  rotateLogs() {
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    [this.logFile, this.runtimeFile].forEach(file => {
      try {
        const stats = fs.statSync(file);
        if (stats.size > maxSize) {
          const backupFile = file + '.' + Date.now() + '.bak';
          fs.renameSync(file, backupFile);
          this.logRuntime('LOG_ROTATED', { originalFile: file, backupFile });
        }
      } catch (error) {
        // File mungkin belum ada, skip
      }
    });
  }
}

// Export singleton instance
const webhookLogger = new WebhookLogger();
module.exports = webhookLogger;