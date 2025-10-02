/**
 * Chat Manager Module
 * Handles chat sessions, messages, and history
 */

import storage from '../../utils/storage.js';
import logger from '../../utils/logger.js';
import eventBus from '../../utils/event-bus.js';
import { generateId } from '../../utils/dom-helpers.js';

const chatLogger = logger.createChild('ChatManager');

// Chat state
export const sessions = new Map();
export let currentSessionId = 'default';
export let sessionCounter = 1;

/**
 * Initialize chat sessions
 */
export async function initializeSessions() {
  try {
    // Load sessions from storage
    const savedSessions = await storage.get('chat_sessions', []);
    const savedCurrentId = await storage.get('current_session_id', 'default');
    
    // Restore sessions
    if (savedSessions.length > 0) {
      savedSessions.forEach(session => {
        sessions.set(session.id, session);
      });
      currentSessionId = savedCurrentId;
      
      // Update counter
      const maxId = Math.max(...savedSessions.map(s => 
        parseInt(s.name.replace('Chat ', '')) || 0
      ));
      sessionCounter = maxId + 1;
    } else {
      // Create default session
      createSession('default', 'Chat 1');
    }
    
    chatLogger.success(`Initialized ${sessions.size} sessions`);
    eventBus.emit('chat:sessions-initialized', { count: sessions.size });
    
    return sessions;
  } catch (error) {
    chatLogger.error('Failed to initialize sessions:', error);
    // Create default session as fallback
    createSession('default', 'Chat 1');
    return sessions;
  }
}

/**
 * Create a new chat session
 */
export function createSession(id = null, name = null) {
  const sessionId = id || generateId('session');
  const sessionName = name || `Chat ${sessionCounter++}`;
  
  const session = {
    id: sessionId,
    name: sessionName,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      messageCount: 0,
      lastMessage: null
    }
  };
  
  sessions.set(sessionId, session);
  saveSessions();
  
  chatLogger.info('Created session:', sessionId);
  eventBus.emit('chat:session-created', session);
  
  return session;
}

/**
 * Delete a chat session
 */
export function deleteSession(sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    chatLogger.warn('Session not found:', sessionId);
    return false;
  }
  
  sessions.delete(sessionId);
  saveSessions();
  
  chatLogger.info('Deleted session:', sessionId);
  eventBus.emit('chat:session-deleted', { id: sessionId });
  
  // If deleted session was current, switch to another
  if (currentSessionId === sessionId) {
    const remaining = Array.from(sessions.keys());
    if (remaining.length > 0) {
      switchSession(remaining[0]);
    } else {
      // Create a new default session
      const newSession = createSession();
      switchSession(newSession.id);
    }
  }
  
  return true;
}

/**
 * Switch to a different session
 */
export function switchSession(sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    chatLogger.warn('Session not found:', sessionId);
    return false;
  }
  
  currentSessionId = sessionId;
  storage.set('current_session_id', sessionId);
  
  chatLogger.debug('Switched to session:', sessionId);
  eventBus.emit('chat:session-switched', session);
  
  return true;
}

/**
 * Rename a session
 */
export function renameSession(sessionId, newName) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    chatLogger.warn('Session not found:', sessionId);
    return false;
  }
  
  session.name = newName;
  session.updatedAt = new Date().toISOString();
  saveSessions();
  
  chatLogger.info('Renamed session:', sessionId, 'to', newName);
  eventBus.emit('chat:session-renamed', { id: sessionId, name: newName });
  
  return true;
}

/**
 * Get current session
 */
export function getCurrentSession() {
  return sessions.get(currentSessionId);
}

/**
 * Get session by ID
 */
export function getSession(sessionId) {
  return sessions.get(sessionId);
}

/**
 * Get all sessions
 */
export function getAllSessions() {
  return Array.from(sessions.values());
}

/**
 * Add message to session
 */
export function addMessage(sessionId, role, content, metadata = {}) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    chatLogger.warn('Session not found:', sessionId);
    return null;
  }
  
  const message = {
    id: generateId('msg'),
    role, // 'user' or 'assistant'
    content,
    timestamp: new Date().toISOString(),
    metadata
  };
  
  session.messages.push(message);
  session.updatedAt = new Date().toISOString();
  session.metadata.messageCount = session.messages.length;
  session.metadata.lastMessage = content.substring(0, 50);
  
  saveSessions();
  
  chatLogger.debug('Added message to session:', sessionId);
  eventBus.emit('chat:message-added', { sessionId, message });
  
  return message;
}

/**
 * Update a message in session
 */
export function updateMessage(sessionId, messageId, updates) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    chatLogger.warn('Session not found:', sessionId);
    return null;
  }
  
  const messageIndex = session.messages.findIndex(m => m.id === messageId);
  
  if (messageIndex === -1) {
    chatLogger.warn('Message not found:', messageId);
    return null;
  }
  
  session.messages[messageIndex] = {
    ...session.messages[messageIndex],
    ...updates
  };
  
  session.updatedAt = new Date().toISOString();
  saveSessions();
  
  chatLogger.debug('Updated message:', messageId);
  eventBus.emit('chat:message-updated', { sessionId, messageId, updates });
  
  return session.messages[messageIndex];
}

/**
 * Delete a message from session
 */
export function deleteMessage(sessionId, messageId) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    chatLogger.warn('Session not found:', sessionId);
    return false;
  }
  
  const messageIndex = session.messages.findIndex(m => m.id === messageId);
  
  if (messageIndex === -1) {
    chatLogger.warn('Message not found:', messageId);
    return false;
  }
  
  session.messages.splice(messageIndex, 1);
  session.metadata.messageCount = session.messages.length;
  session.updatedAt = new Date().toISOString();
  
  saveSessions();
  
  chatLogger.info('Deleted message:', messageId);
  eventBus.emit('chat:message-deleted', { sessionId, messageId });
  
  return true;
}

/**
 * Clear all messages in session
 */
export function clearSession(sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    chatLogger.warn('Session not found:', sessionId);
    return false;
  }
  
  session.messages = [];
  session.metadata.messageCount = 0;
  session.metadata.lastMessage = null;
  session.updatedAt = new Date().toISOString();
  
  saveSessions();
  
  chatLogger.info('Cleared session:', sessionId);
  eventBus.emit('chat:session-cleared', { id: sessionId });
  
  return true;
}

/**
 * Get conversation history for AI
 */
export function getConversationHistory(sessionId, limit = null) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    return [];
  }
  
  const messages = session.messages.map(m => ({
    role: m.role,
    content: m.content
  }));
  
  return limit ? messages.slice(-limit) : messages;
}

/**
 * Search messages across all sessions
 */
export function searchMessages(query) {
  const results = [];
  const searchTerm = query.toLowerCase();
  
  for (const session of sessions.values()) {
    const matches = session.messages.filter(m =>
      m.content.toLowerCase().includes(searchTerm)
    );
    
    if (matches.length > 0) {
      results.push({
        session,
        matches
      });
    }
  }
  
  chatLogger.debug(`Found ${results.length} sessions with matching messages`);
  
  return results;
}

/**
 * Export session to JSON
 */
export function exportSession(sessionId) {
  const session = sessions.get(sessionId);
  
  if (!session) {
    chatLogger.warn('Session not found:', sessionId);
    return null;
  }
  
  return JSON.parse(JSON.stringify(session));
}

/**
 * Import session from JSON
 */
export function importSession(sessionData) {
  if (!sessionData.id || !sessionData.name) {
    chatLogger.error('Invalid session data');
    return null;
  }
  
  // Generate new ID to avoid conflicts
  const newId = generateId('session');
  const imported = {
    ...sessionData,
    id: newId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  sessions.set(newId, imported);
  saveSessions();
  
  chatLogger.success('Imported session:', newId);
  eventBus.emit('chat:session-imported', imported);
  
  return imported;
}

/**
 * Save all sessions to storage
 */
async function saveSessions() {
  try {
    const sessionData = Array.from(sessions.values());
    await storage.set('chat_sessions', sessionData);
    chatLogger.debug(`Saved ${sessionData.length} sessions`);
  } catch (error) {
    chatLogger.error('Failed to save sessions:', error);
  }
}

/**
 * Get chat statistics
 */
export function getChatStats() {
  const allSessions = getAllSessions();
  
  const stats = {
    totalSessions: allSessions.length,
    totalMessages: 0,
    averageMessagesPerSession: 0,
    oldestSession: null,
    newestSession: null,
    mostActiveSession: null
  };
  
  if (allSessions.length === 0) {
    return stats;
  }
  
  allSessions.forEach(session => {
    stats.totalMessages += session.messages.length;
  });
  
  stats.averageMessagesPerSession = Math.round(stats.totalMessages / allSessions.length);
  
  // Find oldest and newest
  const sorted = [...allSessions].sort((a, b) => 
    new Date(a.createdAt) - new Date(b.createdAt)
  );
  stats.oldestSession = sorted[0];
  stats.newestSession = sorted[sorted.length - 1];
  
  // Find most active
  stats.mostActiveSession = allSessions.reduce((max, session) =>
    session.messages.length > max.messages.length ? session : max
  );
  
  return stats;
}

// Expose globally
if (typeof window !== 'undefined') {
  window.ChatManager = {
    sessions,
    currentSessionId,
    initializeSessions,
    createSession,
    deleteSession,
    switchSession,
    renameSession,
    getCurrentSession,
    getSession,
    getAllSessions,
    addMessage,
    updateMessage,
    deleteMessage,
    clearSession,
    getConversationHistory,
    searchMessages,
    exportSession,
    importSession,
    getChatStats
  };
}


