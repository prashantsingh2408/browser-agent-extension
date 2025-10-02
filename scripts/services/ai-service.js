/**
 * AI Service - Unified interface for AI interactions
 * Handles Chrome AI, external APIs, and fallbacks
 */

import logger from '../utils/logger.js';
import eventBus from '../utils/event-bus.js';

class AIService {
  constructor() {
    this.session = null;
    this.isInitialized = false;
    this.capabilities = {
      chromeAI: false,
      languageModel: false,
      writer: false,
      rewriter: false
    };
    this.logger = logger.createChild('AIService');
  }

  /**
   * Initialize AI service
   */
  async initialize() {
    if (this.isInitialized) return true;

    this.logger.info('Initializing AI Service...');

    try {
      // Check Chrome AI capabilities
      await this._checkChromeAI();
      
      this.isInitialized = true;
      eventBus.emit('ai:initialized', this.capabilities);
      
      this.logger.success('AI Service initialized', this.capabilities);
      return true;
    } catch (error) {
      this.logger.error('Failed to initialize AI Service:', error);
      return false;
    }
  }

  /**
   * Check Chrome AI capabilities
   */
  async _checkChromeAI() {
    // Check Language Model (Prompt API)
    if (window.ai?.languageModel) {
      try {
        const availability = await window.ai.languageModel.capabilities();
        this.capabilities.languageModel = availability.available === 'readily';
        this.logger.info('Language Model availability:', availability.available);
      } catch (error) {
        this.logger.warn('Language Model check failed:', error);
      }
    }

    // Check Writer API
    if (window.ai?.writer) {
      try {
        const availability = await window.ai.writer.capabilities();
        this.capabilities.writer = availability.available === 'readily';
        this.logger.info('Writer API availability:', availability.available);
      } catch (error) {
        this.logger.warn('Writer API check failed:', error);
      }
    }

    // Check Rewriter API
    if (window.ai?.rewriter) {
      try {
        const availability = await window.ai.rewriter.capabilities();
        this.capabilities.rewriter = availability.available === 'readily';
        this.logger.info('Rewriter API availability:', availability.available);
      } catch (error) {
        this.logger.warn('Rewriter API check failed:', error);
      }
    }

    this.capabilities.chromeAI = Object.values(this.capabilities).some(v => v);
  }

  /**
   * Create a new AI session
   */
  async createSession(options = {}) {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      if (this.capabilities.languageModel) {
        this.session = await window.ai.languageModel.create({
          systemPrompt: options.systemPrompt || 'You are a helpful assistant.',
          temperature: options.temperature || 0.7,
          topK: options.topK || 3
        });
        
        this.logger.success('AI session created');
        eventBus.emit('ai:session-created');
        return this.session;
      }
      
      throw new Error('No AI capability available');
    } catch (error) {
      this.logger.error('Failed to create AI session:', error);
      throw error;
    }
  }

  /**
   * Send prompt to AI
   */
  async prompt(text, options = {}) {
    if (!this.session && this.capabilities.languageModel) {
      await this.createSession(options);
    }

    if (!this.session) {
      throw new Error('No AI session available');
    }

    try {
      this.logger.debug('Sending prompt:', text.substring(0, 50) + '...');
      
      const response = await this.session.prompt(text);
      
      this.logger.debug('Received response:', response.substring(0, 50) + '...');
      eventBus.emit('ai:response', { text, response });
      
      return response;
    } catch (error) {
      this.logger.error('Prompt failed:', error);
      eventBus.emit('ai:error', error);
      throw error;
    }
  }

  /**
   * Stream prompt response
   */
  async promptStreaming(text, onChunk, options = {}) {
    if (!this.session) {
      await this.createSession(options);
    }

    if (!this.session) {
      throw new Error('No AI session available');
    }

    try {
      this.logger.debug('Streaming prompt:', text.substring(0, 50) + '...');
      
      const stream = await this.session.promptStreaming(text);
      let fullResponse = '';

      for await (const chunk of stream) {
        fullResponse = chunk;
        if (onChunk) {
          onChunk(chunk);
        }
        eventBus.emit('ai:chunk', chunk);
      }

      this.logger.debug('Streaming complete');
      eventBus.emit('ai:response', { text, response: fullResponse });
      
      return fullResponse;
    } catch (error) {
      this.logger.error('Streaming failed:', error);
      eventBus.emit('ai:error', error);
      throw error;
    }
  }

  /**
   * Use Writer API
   */
  async write(prompt, options = {}) {
    if (!this.capabilities.writer) {
      throw new Error('Writer API not available');
    }

    try {
      const writer = await window.ai.writer.create({
        tone: options.tone || 'neutral',
        format: options.format || 'plain-text',
        length: options.length || 'medium'
      });

      const result = await writer.write(prompt);
      this.logger.debug('Writer result:', result.substring(0, 50) + '...');
      
      return result;
    } catch (error) {
      this.logger.error('Writer failed:', error);
      throw error;
    }
  }

  /**
   * Use Rewriter API
   */
  async rewrite(text, options = {}) {
    if (!this.capabilities.rewriter) {
      throw new Error('Rewriter API not available');
    }

    try {
      const rewriter = await window.ai.rewriter.create({
        tone: options.tone || 'as-is',
        format: options.format || 'as-is',
        length: options.length || 'as-is'
      });

      const result = await rewriter.rewrite(text);
      this.logger.debug('Rewriter result:', result.substring(0, 50) + '...');
      
      return result;
    } catch (error) {
      this.logger.error('Rewriter failed:', error);
      throw error;
    }
  }

  /**
   * Destroy current session
   */
  async destroySession() {
    if (this.session) {
      try {
        await this.session.destroy();
        this.session = null;
        this.logger.info('Session destroyed');
        eventBus.emit('ai:session-destroyed');
      } catch (error) {
        this.logger.error('Failed to destroy session:', error);
      }
    }
  }

  /**
   * Get capabilities
   */
  getCapabilities() {
    return { ...this.capabilities };
  }

  /**
   * Check if specific capability is available
   */
  hasCapability(capability) {
    return this.capabilities[capability] || false;
  }

  /**
   * Reset service
   */
  async reset() {
    await this.destroySession();
    this.isInitialized = false;
    await this.initialize();
  }
}

// Export singleton
const aiService = new AIService();
export default aiService;

// Expose globally
if (typeof window !== 'undefined') {
  window.AIService = aiService;
}


