/**
 * DOM Helper Utilities
 */

/**
 * Create an element with attributes and children
 */
export function createElement(tag, attributes = {}, children = []) {
  const element = document.createElement(tag);
  
  // Set attributes
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else if (key.startsWith('on') && typeof value === 'function') {
      element.addEventListener(key.substring(2).toLowerCase(), value);
    } else {
      element.setAttribute(key, value);
    }
  });
  
  // Add children
  children.forEach(child => {
    if (typeof child === 'string') {
      element.appendChild(document.createTextNode(child));
    } else if (child instanceof Node) {
      element.appendChild(child);
    }
  });
  
  return element;
}

/**
 * Safely query selector
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Query all selectors
 */
export function $$(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Add class to element
 */
export function addClass(element, ...classes) {
  if (element) element.classList.add(...classes);
}

/**
 * Remove class from element
 */
export function removeClass(element, ...classes) {
  if (element) element.classList.remove(...classes);
}

/**
 * Toggle class on element
 */
export function toggleClass(element, className, force) {
  if (element) return element.classList.toggle(className, force);
}

/**
 * Show element
 */
export function show(element) {
  if (element) element.style.display = '';
}

/**
 * Hide element
 */
export function hide(element) {
  if (element) element.style.display = 'none';
}

/**
 * Clear element content
 */
export function clear(element) {
  if (element) element.innerHTML = '';
}

/**
 * Append HTML to element
 */
export function appendHTML(element, html) {
  if (element) {
    const template = document.createElement('template');
    template.innerHTML = html.trim();
    element.appendChild(template.content);
  }
}

/**
 * Set HTML content safely
 */
export function setHTML(element, html) {
  if (element) element.innerHTML = html;
}

/**
 * Debounce function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Scroll to element smoothly
 */
export function scrollTo(element, options = {}) {
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      ...options
    });
  }
}

/**
 * Wait for element to appear
 */
export function waitForElement(selector, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Element ${selector} not found within ${timeout}ms`));
    }, timeout);
  });
}

/**
 * Animate element
 */
export function animate(element, keyframes, options = {}) {
  if (!element) return null;
  return element.animate(keyframes, {
    duration: 300,
    easing: 'ease-in-out',
    ...options
  });
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Format file size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date
 */
export function formatDate(date, format = 'short') {
  const d = date instanceof Date ? date : new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString();
  } else if (format === 'long') {
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  } else if (format === 'time') {
    return d.toLocaleTimeString();
  } else if (format === 'datetime') {
    return d.toLocaleString();
  } else if (format === 'relative') {
    return getRelativeTime(d);
  }
  
  return d.toISOString();
}

/**
 * Get relative time string
 */
export function getRelativeTime(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}

/**
 * Generate unique ID
 */
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Sanitize HTML to prevent XSS
 */
export function sanitizeHTML(html) {
  const temp = document.createElement('div');
  temp.textContent = html;
  return temp.innerHTML;
}

// Expose globally for non-module scripts
if (typeof window !== 'undefined') {
  window.DOMHelpers = {
    createElement,
    $,
    $$,
    addClass,
    removeClass,
    toggleClass,
    show,
    hide,
    clear,
    appendHTML,
    setHTML,
    debounce,
    throttle,
    scrollTo,
    waitForElement,
    animate,
    copyToClipboard,
    formatFileSize,
    formatDate,
    getRelativeTime,
    generateId,
    sanitizeHTML
  };
}


