/**
 * Chat UI Module
 * Handles rendering and updating chat interface
 */

import { 
  getCurrentSession, 
  getAllSessions,
  currentSessionId 
} from './chat-manager.js';
import { $, $$, createElement, scrollTo, formatDate } from '../../utils/dom-helpers.js';
import logger from '../../utils/logger.js';
import eventBus from '../../utils/event-bus.js';

const uiLogger = logger.createChild('ChatUI');

/**
 * Render chat messages
 */
export function renderMessages(containerId = 'messages') {
  const container = $(containerId) || document.getElementById(containerId);
  
  if (!container) {
    uiLogger.warn('Messages container not found:', containerId);
    return;
  }
  
  const session = getCurrentSession();
  
  if (!session) {
    container.innerHTML = '<div class="empty-state">No active chat session</div>';
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  // Render messages
  session.messages.forEach(message => {
    const messageEl = createMessageElement(message);
    container.appendChild(messageEl);
  });
  
  // Scroll to bottom
  scrollToBottom(container);
  
  uiLogger.debug(`Rendered ${session.messages.length} messages`);
}

/**
 * Create message element
 */
export function createMessageElement(message) {
  const div = createElement('div', {
    className: `message ${message.role}-message`,
    dataset: { messageId: message.id }
  });
  
  // Avatar
  const avatar = createElement('div', {
    className: 'message-avatar'
  }, [message.role === 'user' ? '👤' : '🤖']);
  
  // Content
  const content = createElement('div', {
    className: 'message-content'
  });
  
  // Use marked.js for markdown if available, otherwise plain text
  if (typeof marked !== 'undefined') {
    content.innerHTML = marked.parse(message.content);
  } else {
    content.textContent = message.content;
  }
  
  // Timestamp
  const timestamp = createElement('div', {
    className: 'message-timestamp'
  }, [formatDate(message.timestamp, 'time')]);
  
  // Actions
  const actions = createElement('div', {
    className: 'message-actions'
  });
  
  // Copy button
  const copyBtn = createElement('button', {
    className: 'message-action-btn',
    title: 'Copy',
    onClick: () => copyMessageContent(message.id)
  }, ['📋']);
  
  actions.appendChild(copyBtn);
  
  // Delete button (for user messages)
  if (message.role === 'user') {
    const deleteBtn = createElement('button', {
      className: 'message-action-btn',
      title: 'Delete',
      onClick: () => deleteMessageHandler(message.id)
    }, ['🗑️']);
    
    actions.appendChild(deleteBtn);
  }
  
  // Assemble message
  div.appendChild(avatar);
  div.appendChild(content);
  div.appendChild(timestamp);
  div.appendChild(actions);
  
  return div;
}

/**
 * Add message to UI (without re-rendering all)
 */
export function appendMessage(message) {
  const container = $('#messages') || document.getElementById('messages');
  
  if (!container) {
    uiLogger.warn('Messages container not found');
    return;
  }
  
  const messageEl = createMessageElement(message);
  container.appendChild(messageEl);
  scrollToBottom(container);
}

/**
 * Update message in UI
 */
export function updateMessageInUI(messageId, content) {
  const messageEl = $(`[data-message-id="${messageId}"]`);
  
  if (!messageEl) {
    uiLogger.warn('Message element not found:', messageId);
    return;
  }
  
  const contentEl = messageEl.querySelector('.message-content');
  
  if (contentEl) {
    if (typeof marked !== 'undefined') {
      contentEl.innerHTML = marked.parse(content);
    } else {
      contentEl.textContent = content;
    }
  }
}

/**
 * Remove message from UI
 */
export function removeMessageFromUI(messageId) {
  const messageEl = $(`[data-message-id="${messageId}"]`);
  
  if (messageEl) {
    messageEl.remove();
  }
}

/**
 * Show typing indicator
 */
export function showTypingIndicator() {
  const container = $('#messages') || document.getElementById('messages');
  
  if (!container) return;
  
  // Remove existing indicator
  hideTypingIndicator();
  
  const indicator = createElement('div', {
    className: 'typing-indicator',
    id: 'typingIndicator'
  });
  
  const avatar = createElement('div', {
    className: 'message-avatar'
  }, ['🤖']);
  
  const dots = createElement('div', {
    className: 'typing-dots'
  });
  
  for (let i = 0; i < 3; i++) {
    dots.appendChild(createElement('span', { className: 'dot' }));
  }
  
  indicator.appendChild(avatar);
  indicator.appendChild(dots);
  
  container.appendChild(indicator);
  scrollToBottom(container);
}

/**
 * Hide typing indicator
 */
export function hideTypingIndicator() {
  const indicator = $('#typingIndicator');
  if (indicator) {
    indicator.remove();
  }
}

/**
 * Scroll to bottom of container
 */
export function scrollToBottom(container) {
  if (container) {
    scrollTo(container.lastElementChild);
  }
}

/**
 * Render session tabs
 */
export function renderSessionTabs(containerId = 'chatTabs') {
  const container = $(containerId) || document.getElementById(containerId);
  
  if (!container) {
    uiLogger.warn('Session tabs container not found');
    return;
  }
  
  const allSessions = getAllSessions();
  container.innerHTML = '';
  
  allSessions.forEach(session => {
    const tab = createSessionTab(session);
    container.appendChild(tab);
  });
  
  // Add new session button
  const newTabBtn = createElement('button', {
    className: 'new-session-btn',
    title: 'New Chat',
    onClick: () => eventBus.emit('chat:new-session-requested')
  }, ['+']);
  
  container.appendChild(newTabBtn);
}

/**
 * Create session tab element
 */
function createSessionTab(session) {
  const isActive = session.id === currentSessionId;
  
  const tab = createElement('div', {
    className: `session-tab ${isActive ? 'active' : ''}`,
    dataset: { sessionId: session.id },
    onClick: () => eventBus.emit('chat:switch-session-requested', session.id)
  });
  
  const name = createElement('span', {
    className: 'session-tab-name'
  }, [session.name]);
  
  const closeBtn = createElement('button', {
    className: 'session-tab-close',
    title: 'Close',
    onClick: (e) => {
      e.stopPropagation();
      eventBus.emit('chat:delete-session-requested', session.id);
    }
  }, ['×']);
  
  tab.appendChild(name);
  tab.appendChild(closeBtn);
  
  return tab;
}

/**
 * Show empty state
 */
export function showEmptyState(containerId = 'messages') {
  const container = $(containerId) || document.getElementById(containerId);
  
  if (!container) return;
  
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">💬</div>
      <h3>Start a conversation</h3>
      <p>Type a message below to begin chatting with the AI assistant</p>
    </div>
  `;
}

/**
 * Copy message content
 */
async function copyMessageContent(messageId) {
  const session = getCurrentSession();
  const message = session?.messages.find(m => m.id === messageId);
  
  if (!message) return;
  
  try {
    await navigator.clipboard.writeText(message.content);
    showToast('Message copied!', 'success');
  } catch (error) {
    uiLogger.error('Failed to copy message:', error);
    showToast('Failed to copy message', 'error');
  }
}

/**
 * Delete message handler
 */
function deleteMessageHandler(messageId) {
  eventBus.emit('chat:delete-message-requested', { 
    sessionId: currentSessionId, 
    messageId 
  });
}

/**
 * Show toast notification
 */
export function showToast(message, type = 'info') {
  const toast = createElement('div', {
    className: `toast toast-${type}`
  }, [message]);
  
  document.body.appendChild(toast);
  
  // Fade in
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Fade out and remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * Update UI state (enable/disable controls)
 */
export function setUIState(state) {
  const sendBtn = $('#sendBtn');
  const input = $('#userInput');
  const clearBtn = $('#clearBtn');
  
  if (state === 'processing') {
    if (input) input.disabled = true;
    if (sendBtn) {
      sendBtn.disabled = false;
      sendBtn.textContent = '⏹️ Stop';
      sendBtn.classList.add('stop-mode');
    }
    if (clearBtn) clearBtn.disabled = true;
  } else {
    if (input) {
      input.disabled = false;
      input.focus();
    }
    if (sendBtn) {
      sendBtn.disabled = !input?.value.trim();
      sendBtn.textContent = '➤';
      sendBtn.classList.remove('stop-mode');
    }
    if (clearBtn) clearBtn.disabled = false;
  }
}

// Expose globally
if (typeof window !== 'undefined') {
  window.ChatUI = {
    renderMessages,
    createMessageElement,
    appendMessage,
    updateMessageInUI,
    removeMessageFromUI,
    showTypingIndicator,
    hideTypingIndicator,
    scrollToBottom,
    renderSessionTabs,
    showEmptyState,
    showToast,
    setUIState
  };
}


