/**
 * Main Application Controller
 * Orchestrates all modules and features
 */

import logger from '../utils/logger.js';
import eventBus from '../utils/event-bus.js';
import storage from '../utils/storage.js';
import aiService from '../services/ai-service.js';

class AppController {
  constructor() {
    this.logger = logger.createChild('AppController');
    this.isInitialized = false;
    this.features = new Map();
  }

  /**
   * Initialize the application
   */
  async initialize() {
    if (this.isInitialized) {
      this.logger.warn('App already initialized');
      return;
    }

    this.logger.info('🚀 Initializing Browser Agent Extension...');

    try {
      // Initialize core services
      await this._initializeServices();
      
      // Setup global event listeners
      this._setupEventListeners();
      
      // Initialize features
      await this._initializeFeatures();
      
      // Setup navigation
      this._setupNavigation();
      
      this.isInitialized = true;
      this.logger.success('✅ Application initialized successfully');
      
      eventBus.emit('app:initialized');
    } catch (error) {
      this.logger.error('Failed to initialize application:', error);
      throw error;
    }
  }

  /**
   * Initialize core services
   */
  async _initializeServices() {
    this.logger.info('Initializing core services...');
    
    // Initialize AI Service
    await aiService.initialize();
    
    this.logger.success('Core services initialized');
  }

  /**
   * Initialize features based on current page
   */
  async _initializeFeatures() {
    this.logger.info('Initializing features...');
    
    // Determine which features to load based on context
    if (this._isExtensionContext()) {
      // Extension side panel - load all features
      await this._loadFeature('chat');
      await this._loadFeature('memory');
      await this._loadFeature('agent');
      await this._loadFeature('mail');
      await this._loadFeature('webdev');
    } else {
      // Web app context - load basic features
      await this._loadFeature('chat');
    }
    
    this.logger.success(`Loaded ${this.features.size} features`);
  }

  /**
   * Load a specific feature
   */
  async _loadFeature(featureName) {
    try {
      this.logger.debug(`Loading feature: ${featureName}`);
      
      // Dynamic import based on feature name
      let feature;
      
      switch (featureName) {
        case 'chat':
          const { initializeSessions } = await import('../features/chat/chat-manager.js');
          await initializeSessions();
          feature = { name: 'chat', loaded: true };
          break;
          
        case 'memory':
          const { loadMemories } = await import('../features/memory/memory-storage.js');
          await loadMemories();
          feature = { name: 'memory', loaded: true };
          break;
          
        case 'agent':
          // Agent feature initialization
          feature = { name: 'agent', loaded: true };
          break;
          
        case 'mail':
          // Mail feature initialization
          feature = { name: 'mail', loaded: true };
          break;
          
        case 'webdev':
          // Webdev feature initialization
          feature = { name: 'webdev', loaded: true };
          break;
          
        default:
          this.logger.warn('Unknown feature:', featureName);
          return;
      }
      
      this.features.set(featureName, feature);
      this.logger.success(`✓ ${featureName} feature loaded`);
      
    } catch (error) {
      this.logger.error(`Failed to load feature ${featureName}:`, error);
    }
  }

  /**
   * Setup global event listeners
   */
  _setupEventListeners() {
    // Listen for navigation events
    eventBus.on('nav:changed', (data) => {
      this.logger.debug('Navigation changed:', data.section);
      this._handleNavigation(data.section);
    });
    
    // Listen for AI events
    eventBus.on('ai:error', (error) => {
      this.logger.error('AI Error:', error);
      this._handleAIError(error);
    });
    
    // Listen for storage events
    eventBus.on('storage:error', (error) => {
      this.logger.error('Storage Error:', error);
    });
    
    // Listen for feature events
    eventBus.on('feature:error', (data) => {
      this.logger.error(`Feature ${data.feature} Error:`, data.error);
    });
  }

  /**
   * Setup navigation system
   */
  _setupNavigation() {
    const navLinks = document.querySelectorAll('[data-section]');
    
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.navigateTo(section);
      });
    });
    
    // Set initial active section
    const hash = window.location.hash.substring(1);
    if (hash) {
      this.navigateTo(hash);
    }
  }

  /**
   * Navigate to a section
   */
  navigateTo(section) {
    // Hide all sections
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Remove active from all nav links
    document.querySelectorAll('[data-section]').forEach(link => {
      link.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(`${section}Tab`);
    if (targetSection) {
      targetSection.classList.add('active');
    }
    
    // Set active nav link
    const targetLink = document.querySelector(`[data-section="${section}"]`);
    if (targetLink) {
      targetLink.classList.add('active');
    }
    
    // Update URL hash
    window.location.hash = section;
    
    // Emit event
    eventBus.emit('nav:changed', { section });
    
    this.logger.debug('Navigated to:', section);
  }

  /**
   * Handle navigation change
   */
  _handleNavigation(section) {
    // Lazy load feature if not already loaded
    if (!this.features.has(section)) {
      this._loadFeature(section);
    }
  }

  /**
   * Handle AI errors
   */
  _handleAIError(error) {
    // Show user-friendly error message
    if (window.ChatUI) {
      window.ChatUI.showToast('AI service error. Please try again.', 'error');
    }
  }

  /**
   * Check if running in extension context
   */
  _isExtensionContext() {
    return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  }

  /**
   * Get app status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      features: Array.from(this.features.keys()),
      isExtension: this._isExtensionContext(),
      aiCapabilities: aiService.getCapabilities()
    };
  }

  /**
   * Reset app
   */
  async reset() {
    this.logger.info('Resetting application...');
    
    // Clear features
    this.features.clear();
    
    // Reset services
    await aiService.reset();
    
    this.isInitialized = false;
    
    // Re-initialize
    await this.initialize();
    
    this.logger.success('Application reset complete');
  }
}

// Create and expose singleton
const appController = new AppController();

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => appController.initialize());
} else {
  appController.initialize();
}

export default appController;

// Expose globally
if (typeof window !== 'undefined') {
  window.AppController = appController;
}

