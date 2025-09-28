/* Chat Module - Coordinates between AI and UI */

import AIManager from './ai.js';
import UIManager from './ui.js';

class ChatController {
  constructor() {
    this.ai = new AIManager();
    this.ui = new UIManager();
    this.isProcessing = false;
  }

  async initialize() {
    try {
      // Initialize AI
      this.ui.updateStatus('Initializing...', 'warning');
      const result = await this.ai.initialize();
      
      if (result.needsDownload) {
        this.ui.updateStatus('Downloading model...', 'warning');
      } else {
        this.ui.updateStatus('Online', 'success');
      }
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Setup AI availability listener
      this.ai.setupAvailabilityListener(async () => {
        await this.initialize();
      });
      
    } catch (error) {
      console.error('Initialization failed:', error);
      this.ui.updateStatus('Offline', 'error');
      this.ui.showError(error.message);
    }
  }

  setupEventListeners() {
    const { userInput, sendBtn, clearBtn } = this.ui.elements;
    
    // Send button
    sendBtn.addEventListener('click', () => this.handleSend());
    
    // Enter key to send
    userInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    
    // Input change
    userInput.addEventListener('input', () => {
      sendBtn.disabled = !userInput.value.trim() || this.isProcessing;
      this.ui.adjustTextareaHeight();
    });
    
    // Clear chat
    clearBtn.addEventListener('click', () => this.ui.clearChat());
    
    // Suggestion chips
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggestion-chip')) {
        const suggestion = e.target.dataset.suggestion;
        const action = e.target.dataset.action;
        
        if (suggestion) {
          userInput.value = suggestion;
          sendBtn.disabled = false;
          this.handleSend();
        } else if (action) {
          this.handleAction(action);
        }
      }
    });
  }

  async handleSend() {
    const message = this.ui.getUserInput();
    if (!message || this.isProcessing) return;
    
    this.isProcessing = true;
    
    // Update UI
    this.ui.hideWelcomeMessage();
    this.ui.addMessage(message, 'user');
    this.ui.clearInput();
    
    // Show loading
    const loadingId = this.ui.showLoading();
    
    try {
      // Get AI response
      this.ui.updateStatus('Thinking...', 'warning');
      const response = await this.ai.sendMessage(message);
      
      // Update UI with response
      this.ui.removeLoading(loadingId);
      this.ui.addMessage(response, 'bot');
      this.ui.updateStatus('Online', 'success');
      
    } catch (error) {
      console.error('Error processing message:', error);
      this.ui.removeLoading(loadingId);
      this.ui.showError('Failed to get response. Please try again.');
      this.ui.updateStatus('Error', 'error');
    } finally {
      this.isProcessing = false;
      this.ui.setSendButtonState(!this.ui.getUserInput());
    }
  }

  async handleAction(action) {
    // Handle special actions like summarize, explain-selection, etc.
    switch(action) {
      case 'summarize':
        this.ui.elements.userInput.value = 'Please summarize the current page';
        this.handleSend();
        break;
      case 'explain-selection':
        this.ui.elements.userInput.value = 'Please explain the selected text';
        this.handleSend();
        break;
      case 'explain-video':
        this.ui.elements.userInput.value = 'Please explain the intro video on this page';
        this.handleSend();
        break;
      default:
        console.log('Unknown action:', action);
    }
  }
}

export default ChatController;
