/* AI Module - Handles all Gemini Nano interactions */

class AIManager {
  constructor() {
    this.session = null;
    this.isAvailable = false;
    this.config = {
      temperature: 0.7,
      topK: 3,
      language: 'en',
      systemPrompt: 'You are a helpful, friendly, and knowledgeable AI assistant. Provide clear, concise, and accurate responses.'
    };
  }

  async initialize() {
    try {
      // Check if LanguageModel API exists
      if (!('LanguageModel' in self)) {
        throw new Error('Chrome AI is not available. Please enable AI features in chrome://flags/');
      }

      // Check model availability
      const availability = await LanguageModel.availability({ language: this.config.language });
      console.log('LanguageModel availability:', availability);

      if (availability === 'unavailable') {
        throw new Error('AI model is unavailable');
      }

      this.isAvailable = true;
      return { 
        status: 'success', 
        needsDownload: availability === 'after-download' 
      };
    } catch (error) {
      console.error('AI initialization failed:', error);
      this.isAvailable = false;
      throw error;
    }
  }

  async createSession() {
    if (!this.isAvailable) {
      throw new Error('AI is not available');
    }

    if (!this.session) {
      console.log('Creating new AI session...');
      this.session = await LanguageModel.create(this.config);
      console.log('AI session created successfully');
    }

    return this.session;
  }

  async sendMessage(message) {
    try {
      const session = await this.createSession();
      const response = await session.prompt(message, { language: this.config.language });
      return response;
    } catch (error) {
      console.error('Failed to process message:', error);
      throw error;
    }
  }

  destroy() {
    this.session = null;
  }

  setupAvailabilityListener(callback) {
    if ('LanguageModel' in self) {
      LanguageModel.addEventListener?.('availabilitychange', callback);
    }
  }
}

export default AIManager;
