/**
 * Event Bus - Simple pub/sub system for decoupled communication
 */

class EventBus {
  constructor() {
    this.events = new Map();
    this.debug = false;
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    
    this.events.get(event).add(callback);
    
    if (this.debug) {
      console.log(`📡 EventBus: Subscribed to "${event}"`);
    }
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    const callbacks = this.events.get(event);
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        this.events.delete(event);
      }
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    const callbacks = this.events.get(event);
    
    if (this.debug) {
      console.log(`📡 EventBus: Emitting "${event}"`, data);
    }
    
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    const wrapper = (data) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Clear all event listeners
   */
  clear() {
    this.events.clear();
  }

  /**
   * Enable/disable debug mode
   */
  setDebug(enabled) {
    this.debug = enabled;
  }
}

// Export singleton instance
const eventBus = new EventBus();
export default eventBus;

// Also expose globally for non-module scripts
if (typeof window !== 'undefined') {
  window.EventBus = eventBus;
}


