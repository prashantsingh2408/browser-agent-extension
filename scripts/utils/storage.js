/**
 * Storage Utilities - Unified storage interface with compression and validation
 */

class StorageManager {
  constructor() {
    this.isExtension = typeof chrome !== 'undefined' && chrome.storage;
    this.cache = new Map();
  }

  /**
   * Save data to storage
   * @param {string} key - Storage key
   * @param {*} value - Value to store
   * @param {Object} options - Options (compress, ttl)
   */
  async set(key, value, options = {}) {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        ...(options.ttl && { expiresAt: Date.now() + options.ttl })
      };

      if (this.isExtension) {
        await chrome.storage.local.set({ [key]: data });
      } else {
        localStorage.setItem(key, JSON.stringify(data));
      }

      // Update cache
      this.cache.set(key, data);
      
      return true;
    } catch (error) {
      console.error(`Storage set error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get data from storage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if not found
   */
  async get(key, defaultValue = null) {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        const cached = this.cache.get(key);
        if (!this._isExpired(cached)) {
          return cached.value;
        }
        // Remove expired from cache
        this.cache.delete(key);
      }

      let data;
      if (this.isExtension) {
        const result = await chrome.storage.local.get(key);
        data = result[key];
      } else {
        const item = localStorage.getItem(key);
        data = item ? JSON.parse(item) : null;
      }

      // Check expiration
      if (data && this._isExpired(data)) {
        await this.remove(key);
        return defaultValue;
      }

      // Update cache
      if (data) {
        this.cache.set(key, data);
        return data.value;
      }

      return defaultValue;
    } catch (error) {
      console.error(`Storage get error for key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Remove data from storage
   * @param {string} key - Storage key
   */
  async remove(key) {
    try {
      if (this.isExtension) {
        await chrome.storage.local.remove(key);
      } else {
        localStorage.removeItem(key);
      }
      this.cache.delete(key);
      return true;
    } catch (error) {
      console.error(`Storage remove error for key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all storage
   */
  async clear() {
    try {
      if (this.isExtension) {
        await chrome.storage.local.clear();
      } else {
        localStorage.clear();
      }
      this.cache.clear();
      return true;
    } catch (error) {
      console.error('Storage clear error:', error);
      return false;
    }
  }

  /**
   * Get all keys
   */
  async keys() {
    try {
      if (this.isExtension) {
        const items = await chrome.storage.local.get(null);
        return Object.keys(items);
      } else {
        return Object.keys(localStorage);
      }
    } catch (error) {
      console.error('Storage keys error:', error);
      return [];
    }
  }

  /**
   * Check if data is expired
   */
  _isExpired(data) {
    if (!data || !data.expiresAt) return false;
    return Date.now() > data.expiresAt;
  }

  /**
   * Get storage usage (extension only)
   */
  async getUsage() {
    if (!this.isExtension) return null;
    
    try {
      const usage = await chrome.storage.local.getBytesInUse();
      const quota = chrome.storage.local.QUOTA_BYTES;
      return {
        used: usage,
        total: quota,
        percentage: (usage / quota) * 100
      };
    } catch (error) {
      console.error('Storage usage error:', error);
      return null;
    }
  }
}

// Export singleton
const storage = new StorageManager();
export default storage;

// Also expose globally
if (typeof window !== 'undefined') {
  window.StorageManager = storage;
}

