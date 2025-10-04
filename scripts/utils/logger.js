/**
 * Logger Utility - Consistent logging across the application
 */

class Logger {
  constructor(context = 'App') {
    this.context = context;
    this.enabled = true;
    this.logLevel = 'info'; // debug, info, warn, error
    this.history = [];
    this.maxHistory = 100;
  }

  _log(level, emoji, ...args) {
    if (!this.enabled) return;
    
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] < levels[this.logLevel]) return;

    const timestamp = new Date().toISOString();
    const message = `${emoji} [${this.context}] ${timestamp}`;
    
    // Store in history
    this.history.push({
      level,
      timestamp,
      context: this.context,
      args
    });
    
    // Trim history
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }

    // Console output
    const method = level === 'debug' ? 'log' : level;
    console[method](message, ...args);
  }

  debug(...args) {
    this._log('debug', '🔍', ...args);
  }

  info(...args) {
    this._log('info', 'ℹ️', ...args);
  }

  warn(...args) {
    this._log('warn', '⚠️', ...args);
  }

  error(...args) {
    this._log('error', '❌', ...args);
  }

  success(...args) {
    this._log('info', '✅', ...args);
  }

  group(label) {
    if (this.enabled) console.group(label);
  }

  groupEnd() {
    if (this.enabled) console.groupEnd();
  }

  table(data) {
    if (this.enabled) console.table(data);
  }

  time(label) {
    if (this.enabled) console.time(label);
  }

  timeEnd(label) {
    if (this.enabled) console.timeEnd(label);
  }

  clear() {
    this.history = [];
  }

  getHistory(level = null) {
    if (level) {
      return this.history.filter(entry => entry.level === level);
    }
    return this.history;
  }

  setLevel(level) {
    this.logLevel = level;
  }

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  createChild(childContext) {
    return new Logger(`${this.context}:${childContext}`);
  }
}

// Create default logger
const logger = new Logger('BrowserAgent');

// Export
export default logger;
export { Logger };

// Expose globally
if (typeof window !== 'undefined') {
  window.Logger = logger;
}




