/**
 * Main Entry Point - Simplified
 * Loads and initializes the application with new modular architecture
 */

/* global chrome */

// Core modules are loaded via HTML script tags in order:
// 1. utils/logger.js
// 2. utils/event-bus.js
// 3. utils/storage.js
// 4. utils/dom-helpers.js
// 5. services/ai-service.js
// 6. core/app-controller.js

console.log('🚀 Browser Agent Extension - Main Entry Point');

// Configuration
const APP_CONFIG = {
  name: 'Browser Agent Extension',
  version: '2.0.0',
  debug: true
};

// Global app state
window.APP = {
  config: APP_CONFIG,
  ready: false,
  features: {}
};

/**
 * Initialize application
 */
async function initializeApp() {
  try {
    console.log('📦 Initializing application...');
    
    // Set debug mode
    if (APP_CONFIG.debug && window.Logger) {
      window.Logger.setLevel('debug');
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
      await new Promise(resolve => {
        document.addEventListener('DOMContentLoaded', resolve);
      });
    }
    
    // Initialize app controller (handles everything)
    if (window.AppController) {
      await window.AppController.initialize();
    } else {
      console.error('AppController not found. Make sure core modules are loaded.');
      return;
    }
    
    // Setup global error handling
    setupErrorHandling();
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts();
    
    // App is ready
    window.APP.ready = true;
    
    if (window.EventBus) {
      window.EventBus.emit('app:ready');
    }
    
    console.log('✅ Application initialized successfully');
    
    // Log app status
    if (window.AppController) {
      console.log('📊 App Status:', window.AppController.getStatus());
    }
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    showErrorMessage('Failed to initialize application. Please refresh the page.');
  }
}

/**
 * Setup global error handling
 */
function setupErrorHandling() {
  // Catch unhandled errors
  window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
    
    if (window.Logger) {
      window.Logger.error('Unhandled error:', event.error);
    }
  });
  
  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    
    if (window.Logger) {
      window.Logger.error('Unhandled rejection:', event.reason);
    }
  });
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K: Focus search/input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const input = document.getElementById('userInput') || 
                   document.querySelector('input[type="text"]');
      if (input) input.focus();
    }
    
    // Ctrl/Cmd + /: Show keyboard shortcuts help
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      showKeyboardHelp();
    }
    
    // Escape: Close modals/dialogs
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });
}

/**
 * Show keyboard shortcuts help
 */
function showKeyboardHelp() {
  const shortcuts = [
    { keys: 'Ctrl/Cmd + K', action: 'Focus input' },
    { keys: 'Ctrl/Cmd + /', action: 'Show shortcuts' },
    { keys: 'Escape', action: 'Close modals' },
    { keys: 'Enter', action: 'Send message' },
    { keys: 'Shift + Enter', action: 'New line' }
  ];
  
  const helpText = shortcuts
    .map(s => `${s.keys}: ${s.action}`)
    .join('\n');
  
  console.log('⌨️  Keyboard Shortcuts:\n' + helpText);
  
  if (window.ChatUI) {
    window.ChatUI.showToast('Check console for keyboard shortcuts', 'info');
  }
}

/**
 * Close all modals
 */
function closeAllModals() {
  const modals = document.querySelectorAll('.modal, [role="dialog"]');
  modals.forEach(modal => {
    if (modal.classList.contains('show')) {
      modal.classList.remove('show');
      // Emit close event if event bus is available
      if (window.EventBus) {
        window.EventBus.emit('modal:closed', { element: modal });
      }
    }
  });
}

/**
 * Show error message to user
 */
function showErrorMessage(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'global-error';
  errorDiv.innerHTML = `
    <div class="error-content">
      <span class="error-icon">⚠️</span>
      <span class="error-message">${message}</span>
      <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 5 seconds
  setTimeout(() => errorDiv.remove(), 5000);
}

/**
 * Detect environment
 */
function detectEnvironment() {
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  const isWebApp = !isExtension;
  
  console.log('🌍 Environment:', isExtension ? 'Extension' : 'Web App');
  
  return { isExtension, isWebApp };
}

/**
 * Check browser compatibility
 */
function checkCompatibility() {
  const checks = {
    localStorage: typeof localStorage !== 'undefined',
    promises: typeof Promise !== 'undefined',
    fetch: typeof fetch !== 'undefined',
    esModules: (() => {
      try {
        new Function('import("")');
        return true;
      } catch (e) {
        return false;
      }
    })()
  };
  
  const compatible = Object.values(checks).every(v => v);
  
  if (!compatible) {
    console.warn('⚠️  Browser compatibility issues detected:', checks);
  }
  
  return { compatible, checks };
}

// Run initialization
(async function() {
  console.log('🎯 Starting Browser Agent Extension...');
  
  // Detect environment
  const env = detectEnvironment();
  window.APP.environment = env;
  
  // Check compatibility
  const compat = checkCompatibility();
  window.APP.compatibility = compat;
  
  if (!compat.compatible) {
    showErrorMessage('Your browser may not support all features. Please use a modern browser.');
  }
  
  // Initialize
  await initializeApp();
})();

// Expose initialization function globally for debugging
window.reinitializeApp = initializeApp;

console.log('💡 Type "window.APP" in console to see app state');
console.log('💡 Type "window.reinitializeApp()" to reinitialize');




