/* UI Module - Handles all UI updates and interactions */

class UIManager {
  constructor() {
    this.elements = {
      messagesContainer: document.getElementById('messages'),
      userInput: document.getElementById('userInput'),
      sendBtn: document.getElementById('sendBtn'),
      clearBtn: document.getElementById('clearBtn'),
      statusText: document.getElementById('statusText'),
      statusDot: document.querySelector('.status-dot')
    };
    
    this.statusColors = {
      success: '#34a853',
      warning: '#fbbc04',
      error: '#ea4335',
      neutral: '#9aa0a6'
    };
  }

  // Status management
  updateStatus(text, type = 'neutral') {
    if (this.elements.statusText) {
      this.elements.statusText.textContent = text;
    }
    
    if (this.elements.statusDot) {
      this.elements.statusDot.style.background = this.statusColors[type] || this.statusColors.neutral;
    }
  }

  // Welcome screen
  hideWelcomeMessage() {
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.style.display = 'none';
    }
  }

  // Message management
  addMessage(content, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = type === 'user' ? '👤' : '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = this.formatMessage(content);
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    this.elements.messagesContainer.appendChild(messageDiv);
    
    this.scrollToBottom();
  }

  formatMessage(text) {
    // Escape HTML
    let formatted = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Headers
    formatted = formatted.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    formatted = formatted.replace(/^# (.+)$/gm, '<h2>$1</h2>');
    
    // Bold
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Code blocks
    formatted = formatted.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
    
    // Lists
    formatted = formatted.replace(/^\* (.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Paragraphs
    formatted = formatted.replace(/\n\n/g, '</p><p>');
    formatted = '<p>' + formatted + '</p>';
    
    return formatted;
  }

  // Loading animation
  showLoading() {
    const loadingId = 'loading-' + Date.now();
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    messageDiv.id = loadingId;
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = '🤖';
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
      <div class="loading">
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
        <div class="loading-dot"></div>
      </div>
    `;
    
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    this.elements.messagesContainer.appendChild(messageDiv);
    
    this.scrollToBottom();
    return loadingId;
  }

  removeLoading(loadingId) {
    const loadingElement = document.getElementById(loadingId);
    if (loadingElement) {
      loadingElement.remove();
    }
  }

  // Error display
  showError(message) {
    this.addMessage(`⚠️ ${message}`, 'bot');
  }

  // Chat management
  clearChat() {
    const welcomeMessage = document.querySelector('.welcome-message');
    this.elements.messagesContainer.innerHTML = '';
    if (welcomeMessage) {
      this.elements.messagesContainer.appendChild(welcomeMessage);
      welcomeMessage.style.display = 'flex';
    }
  }

  // Input management
  clearInput() {
    this.elements.userInput.value = '';
    this.elements.sendBtn.disabled = true;
    this.adjustTextareaHeight();
  }

  getUserInput() {
    return this.elements.userInput.value.trim();
  }

  setSendButtonState(disabled) {
    this.elements.sendBtn.disabled = disabled;
  }

  adjustTextareaHeight() {
    const textarea = this.elements.userInput;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
  }

  scrollToBottom() {
    this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
  }
}

export default UIManager;
