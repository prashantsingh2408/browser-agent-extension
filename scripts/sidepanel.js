/* global LanguageModel */

// Function handler will be available from functions.js

// DOM Elements
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
let sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const statusText = document.getElementById('statusText');
const statusDot = document.querySelector('.status-dot');

// AI Session Management - Pool approach for better isolation
let aiSessionPool = [];
let maxPoolSize = 3; // Limit concurrent AI sessions
let conversationHistory = [];

// Session Management
let sessions = new Map();
let currentSessionId = 'default';
let sessionCounter = 1;

// Per-session processing states
let sessionProcessingStates = new Map(); // sessionId -> { isProcessing, abortController, streamingData }

// Global streaming state (independent of UI)
let activeStreams = new Map(); // sessionId -> { promise, data }

// Helper functions for session processing state
function isSessionProcessing(sessionId = currentSessionId) {
  const state = sessionProcessingStates.get(sessionId);
  return state ? state.isProcessing : false;
}

function setSessionProcessing(sessionId = currentSessionId, processing = true, abortController = null, streamingData = null) {
  if (processing) {
    sessionProcessingStates.set(sessionId, { 
      isProcessing: true, 
      abortController: abortController,
      streamingData: streamingData
    });
  } else {
    sessionProcessingStates.delete(sessionId);
    
    // Remove processing indicators when processing completes
    if (sessionId === currentSessionId) {
      const backgroundIndicators = document.querySelectorAll('.background-indicator');
      backgroundIndicators.forEach(indicator => indicator.remove());
      
      const pendingMessages = document.querySelectorAll('.pending-response');
      pendingMessages.forEach(msg => msg.remove());
    }
  }
  
  // Update UI only for current session
  if (sessionId === currentSessionId) {
    updateUIForProcessingState(processing);
  }
  
  // Update tabs UI to show processing indicators
  updateTabsUI();
}

function getSessionAbortController(sessionId = currentSessionId) {
  const state = sessionProcessingStates.get(sessionId);
  return state ? state.abortController : null;
}

function updateUIForProcessingState(processing) {
  userInput.disabled = processing;
  setButtonsDisabled(processing);
  
  if (processing) {
    transformToStopButton();
    // Stop button should be enabled when processing
    sendBtn.disabled = false;
  } else {
    transformToSendButton();
    // Send button disabled if no input text
    sendBtn.disabled = !userInput.value.trim();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeAI();
  await initializeSessions();
  setupEventListeners();
  setupMainNavigation();
});

// Initialize AI
async function initializeAI() {
  try {
    updateStatus('Initializing...', 'warning');
    
    // Check if LanguageModel is available
    if (!('LanguageModel' in self)) {
      throw new Error('Chrome AI is not available. Please enable AI features in chrome://flags/');
    }
    
    // Check availability
    const availability = await LanguageModel.availability({ language: 'en' });
    console.log('LanguageModel availability:', availability);
    
    if (availability === 'unavailable') {
      throw new Error('AI model is unavailable');
    }
    
    if (availability === 'after-download') {
      updateStatus('Downloading model...', 'warning');
      // The model will be downloaded automatically when first used
    }
    
    updateStatus('Online', 'success');
  } catch (error) {
    console.error('AI initialization failed:', error);
    updateStatus('Offline', 'error');
    showError(error.message);
  }
}

// Get available AI session from pool
async function getAvailableAISession() {
  try {
    if (!('LanguageModel' in self)) {
      throw new Error('LanguageModel API not available');
    }
    
    // Find an available session from the pool
    for (let session of aiSessionPool) {
      if (session && !session.busy) {
        session.busy = true;
        return session;
      }
    }
    
    // If no available session and pool not full, create new one
    if (aiSessionPool.length < maxPoolSize) {
      console.log(`Creating new AI session (${aiSessionPool.length + 1}/${maxPoolSize})`);
      
      updateStatus('Loading model...', 'warning');
      
      const systemPrompt = `You are a helpful, friendly, and knowledgeable AI assistant. Provide clear, concise, and accurate responses. You can help analyze content that users share with you.`;

      const newAISession = await LanguageModel.create({
        temperature: 0.7,
        topK: 3,
        language: 'en',
        systemPrompt: systemPrompt
      });
      
      newAISession.busy = true;
      aiSessionPool.push(newAISession);
      
      console.log(`AI session created successfully (Pool size: ${aiSessionPool.length})`);
      updateStatus('Online', 'success');
      
      return newAISession;
    }
    
    // If pool is full, wait for an available session
    return await waitForAvailableSession();
    
  } catch (error) {
    console.error('Failed to get AI session:', error);
    updateStatus('Offline', 'error');
    throw error;
  }
}

// Wait for an available session (with timeout)
async function waitForAvailableSession(timeout = 30000) {
  const startTime = Date.now();
  
  return new Promise((resolve, reject) => {
    const checkInterval = setInterval(() => {
      // Check for available session
      for (let session of aiSessionPool) {
        if (session && !session.busy) {
          session.busy = true;
          clearInterval(checkInterval);
          resolve(session);
          return;
        }
      }
      
      // Check timeout
      if (Date.now() - startTime > timeout) {
        clearInterval(checkInterval);
        reject(new Error('Timeout waiting for available AI session'));
      }
    }, 100);
  });
}

// Release AI session back to pool
function releaseAISession(session) {
  if (session) {
    session.busy = false;
  }
}

// Start background streaming (UI-independent)
async function startBackgroundStream(message, sessionId, abortController) {
  let aiSession = null;
  
  try {
    aiSession = await getAvailableAISession();
    
    let fullResponse = '';
    
    // Check if streaming is supported
    if (aiSession.promptStreaming) {
      const stream = aiSession.promptStreaming(message, { 
        language: 'en',
        signal: abortController.signal
      });
      
      for await (const chunk of stream) {
        if (abortController.signal?.aborted) {
          throw new DOMException('Generation stopped by user', 'AbortError');
        }
        
        fullResponse += chunk;
        
        // Update streaming data for this session
        const streamData = activeStreams.get(sessionId);
        if (streamData) {
          streamData.data.fullResponse = fullResponse;
        }
        
        // Trigger UI update if this session is currently active
        if (currentSessionId === sessionId) {
          updateStreamingUI(sessionId, chunk);
        }
      }
    } else {
      // Fallback to regular prompt
      fullResponse = await aiSession.prompt(message, { 
        language: 'en',
        signal: abortController.signal
      });
      
      // Update streaming data
      const streamData = activeStreams.get(sessionId);
      if (streamData) {
        streamData.data.fullResponse = fullResponse;
        streamData.data.isComplete = true;
      }
    }
    
    return fullResponse;
    
  } finally {
    if (aiSession) {
      releaseAISession(aiSession);
    }
  }
}

// Global map to track active monitoring intervals
let activeMonitors = new Map(); // sessionId -> intervalId

// Monitor stream for UI updates
function monitorStreamForUI(sessionId, streamingMessage) {
  // Clear any existing monitor for this session
  if (activeMonitors.has(sessionId)) {
    clearInterval(activeMonitors.get(sessionId));
    activeMonitors.delete(sessionId);
  }
  
  // Store sessionId on the streaming message element for tracking
  if (streamingMessage && streamingMessage.element) {
    streamingMessage.element.dataset.sessionId = sessionId;
  }
  
  const checkInterval = setInterval(() => {
    const streamData = activeStreams.get(sessionId);
    if (!streamData) {
      clearInterval(checkInterval);
      activeMonitors.delete(sessionId);
      return;
    }
    
    // Update UI if this is still the current session
    if (currentSessionId === sessionId && streamingMessage && streamingMessage.contentDiv) {
      // Update streaming message with latest content
      const currentContent = streamData.data.fullResponse;
      if (currentContent && streamingMessage.appendChunk) {
        // Use appendChunk to properly update the content
        streamingMessage.appendChunk(currentContent);
      }
    }
    
    // Check if stream is complete
    if (streamData.data.isComplete) {
      clearInterval(checkInterval);
      activeMonitors.delete(sessionId);
      // Don't finalize here - let the main completion handler do it
    }
  }, 100);
  
  // Store the interval ID
  activeMonitors.set(sessionId, checkInterval);
}

// Update streaming UI
function updateStreamingUI(sessionId, chunk) {
  if (currentSessionId !== sessionId) return;
  
  const streamingElement = document.querySelector('.message.streaming');
  if (streamingElement) {
    const contentDiv = streamingElement.querySelector('.streaming-content');
    if (contentDiv) {
      const cursor = contentDiv.querySelector('.streaming-cursor');
      if (cursor) cursor.remove();
      
      const textSpan = document.createElement('span');
      textSpan.textContent = chunk;
      contentDiv.appendChild(textSpan);
      
      // Re-add cursor
      const cursorSpan = document.createElement('span');
      cursorSpan.className = 'streaming-cursor';
      cursorSpan.textContent = '▊';
      contentDiv.appendChild(cursorSpan);
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

// Initialize Sessions
async function initializeSessions() {
  try {
    // Load sessions from storage
    const result = await chrome.storage.local.get(['chatSessions', 'currentSessionId']);
    
    if (result.chatSessions) {
      sessions = new Map(Object.entries(result.chatSessions));
    }
    
    if (result.currentSessionId) {
      currentSessionId = result.currentSessionId;
    }
    
    // Create default session if none exists
    if (sessions.size === 0) {
      const defaultSession = createNewSession('Chat 1', true);
      currentSessionId = defaultSession.id;
    }
    
    // Update UI
    updateTabsUI();
    loadCurrentSession();
    await loadChatHistory();
  } catch (error) {
    console.error('Failed to initialize sessions:', error);
    // Create default session as fallback
    const defaultSession = createNewSession('Chat 1', true);
    currentSessionId = defaultSession.id;
    updateTabsUI();
  }
}

// Create new session
function createNewSession(title = null, isDefault = false) {
  const sessionId = isDefault ? 'default' : `session_${Date.now()}`;
  const sessionTitle = title || `Chat ${sessionCounter++}`;
  
  const session = {
    id: sessionId,
    title: sessionTitle,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  sessions.set(sessionId, session);
  saveSessions();
  return session;
}

// Save sessions to storage
async function saveSessions() {
  try {
    const sessionsObj = Object.fromEntries(sessions);
    await chrome.storage.local.set({
      chatSessions: sessionsObj,
      currentSessionId: currentSessionId
    });
  } catch (error) {
    console.error('Failed to save sessions:', error);
  }
}

// Switch to session
function switchToSession(sessionId) {
  if (currentSessionId === sessionId) return;
  
  // Stop monitoring the old session's stream UI
  if (activeMonitors.has(currentSessionId)) {
    clearInterval(activeMonitors.get(currentSessionId));
    activeMonitors.delete(currentSessionId);
  }
  
  // Save current session state
  saveCurrentSessionState();
  
  // Switch to new session
  currentSessionId = sessionId;
  loadCurrentSession();
  updateTabsUI();
  saveSessions();
  
  // Update UI for new session's processing state
  const isNewSessionProcessing = isSessionProcessing(sessionId);
  updateUIForProcessingState(isNewSessionProcessing);
  
  // Force update send button state after switching
  setTimeout(() => {
    if (!isSessionProcessing(currentSessionId)) {
      sendBtn.disabled = !userInput.value.trim();
    }
  }, 50);
}

// Save current session state
function saveCurrentSessionState() {
  if (!sessions.has(currentSessionId)) return;
  
  const session = sessions.get(currentSessionId);
  const messages = Array.from(messagesContainer.children)
    .filter(el => el.classList.contains('message') && !el.classList.contains('streaming'))
    .map(el => {
      // Use stored original content if available, otherwise extract clean text
      let content = el.dataset.originalContent;
      
      if (!content) {
        const contentDiv = el.querySelector('.message-content');
        if (contentDiv) {
          // Clone the content div to avoid modifying the original
          const contentClone = contentDiv.cloneNode(true);
          
          // Remove action buttons from the clone before getting text
          const actionsDiv = contentClone.querySelector('.message-actions');
          if (actionsDiv) {
            actionsDiv.remove();
          }
          
          // Get clean text content without button text
          content = contentClone.textContent || '';
        }
      }
      
      return {
        type: el.classList.contains('user') ? 'user' : 'bot',
        content: content || '',
        timestamp: new Date().toISOString()
      };
    });
  
  session.messages = messages;
  session.updatedAt = new Date().toISOString();
  sessions.set(currentSessionId, session);
}

// Create welcome message element
function createWelcomeMessage() {
  const welcomeDiv = document.createElement('div');
  welcomeDiv.className = 'welcome-message';
  welcomeDiv.innerHTML = `
    <div class="welcome-animation">
      <div class="welcome-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="url(#gradient)" stroke-width="1.5"/>
          <circle cx="9" cy="10" r="1.5" fill="url(#gradient)"/>
          <circle cx="15" cy="10" r="1.5" fill="url(#gradient)"/>
          <path d="M8 14c0 2.21 1.79 4 4 4s4-1.79 4-4" stroke="url(#gradient)" stroke-width="1.5" stroke-linecap="round"/>
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#4285f4;stop-opacity:1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div class="pulse-ring"></div>
    </div>
    <h2 class="gradient-text">Hello! Ready to assist you</h2>
    <p class="subtitle">Powered by Chrome AI • Lightning fast • Always private</p>
    <div class="suggestions">
      <button class="suggestion-chip action-chip" data-action="summarize">📄 Summarize this page</button>
      <button class="suggestion-chip action-chip" data-action="explain-selection">💡 Explain selected text</button>
      <button class="suggestion-chip action-chip" data-action="explain-video">🎥 Explain intro video</button>
      <button class="suggestion-chip" data-suggestion="What can you help me with?">❓ What can you do?</button>
    </div>
  `;
  return welcomeDiv;
}

// Load current session
function loadCurrentSession() {
  const session = sessions.get(currentSessionId);
  if (!session) return;
  
  // Clear current messages and any background indicators
  messagesContainer.innerHTML = '';
  
  // Clean up any leftover processing indicators
  setTimeout(() => {
    const backgroundIndicators = document.querySelectorAll('.background-indicator');
    backgroundIndicators.forEach(indicator => indicator.remove());
  }, 10);
  
  // Check if this session is currently streaming
  const processingState = sessionProcessingStates.get(currentSessionId);
  
  // Restore messages or show welcome
  if (session.messages && session.messages.length > 0) {
    session.messages.forEach(msg => {
      addMessage(msg.content, msg.type);
    });
  } else {
    // Show welcome message for empty sessions
    const welcomeMessage = createWelcomeMessage();
    messagesContainer.appendChild(welcomeMessage);
  }
  
  // If session is currently streaming, restore the streaming UI
  const activeStream = activeStreams.get(currentSessionId);
  if (activeStream && !activeStream.data.isComplete) {
    // Check if we need to show streaming response
    const lastMessage = session.messages && session.messages.length > 0 ? 
      session.messages[session.messages.length - 1] : null;
    
    // Only show streaming if last message was from user (expecting bot response)
    if (!lastMessage || lastMessage.type === 'user') {
      // Check if there's already a streaming message in DOM for this session
      let streamingMessage = null;
      const existingStreamingMsg = document.querySelector(`.message.bot.streaming[data-session-id="${currentSessionId}"]`);
      
      if (existingStreamingMsg) {
        // Reuse existing streaming message
        const contentDiv = existingStreamingMsg.querySelector('.message-content');
        streamingMessage = {
          element: existingStreamingMsg,
          messageDiv: existingStreamingMsg,
          contentDiv: contentDiv,
          appendChunk: function(fullText) {
            // Remove cursor temporarily
            const cursor = contentDiv.querySelector('.streaming-cursor');
            if (cursor) cursor.remove();
            
            // Clear existing content and set the full text
            contentDiv.innerHTML = '';
            const textSpan = document.createElement('span');
            textSpan.textContent = fullText;
            contentDiv.appendChild(textSpan);
            
            // Re-add cursor
            const cursorSpan = document.createElement('span');
            cursorSpan.className = 'streaming-cursor';
            cursorSpan.textContent = '▊';
            contentDiv.appendChild(cursorSpan);
          }
        };
      } else {
        // Create new streaming message if none exists
        streamingMessage = addStreamingMessage('bot');
        if (streamingMessage && streamingMessage.element) {
          streamingMessage.element.dataset.sessionId = currentSessionId;
        }
      }
      
      // Show accumulated content so far
      if (activeStream.data.fullResponse && streamingMessage) {
        streamingMessage.appendChunk(activeStream.data.fullResponse);
      }
      
      // Continue monitoring this stream for updates
      if (streamingMessage) {
        monitorStreamForUI(currentSessionId, streamingMessage);
      }
    }
  }
}

// Update tabs UI
function updateTabsUI() {
  const tabsContainer = document.querySelector('.tabs-container');
  tabsContainer.innerHTML = '';
  
  sessions.forEach((session, sessionId) => {
    const tab = document.createElement('div');
    const isActive = sessionId === currentSessionId;
    const isProcessing = isSessionProcessing(sessionId);
    
    tab.className = `tab ${isActive ? 'active' : ''} ${isProcessing ? 'processing' : ''}`;
    tab.dataset.sessionId = sessionId;
    
    // Add processing indicator
    const processingIndicator = isProcessing ? '<span class="processing-dot"></span>' : '';
    
    tab.innerHTML = `
      <span class="tab-title">${session.title}</span>
      ${processingIndicator}
      <button class="tab-close" title="Close tab">×</button>
    `;
    
    // Tab click handler
    tab.addEventListener('click', (e) => {
      if (!e.target.classList.contains('tab-close')) {
        switchToSession(sessionId);
      }
    });
    
    // Close button handler
    tab.querySelector('.tab-close').addEventListener('click', (e) => {
      e.stopPropagation();
      closeSession(sessionId);
    });
    
    tabsContainer.appendChild(tab);
  });
}

// Close session
function closeSession(sessionId) {
  if (sessions.size <= 1) {
    // Don't close last session, just clear it
    clearChat();
    return;
  }
  
  // Clean up processing state for the session being closed
  if (isSessionProcessing(sessionId)) {
    const abortController = getSessionAbortController(sessionId);
    if (abortController) {
      abortController.abort();
    }
    sessionProcessingStates.delete(sessionId);
  }
  
  // Note: AI sessions are managed by the pool, no per-session cleanup needed
  
  sessions.delete(sessionId);
  
  // If closing current session, switch to another
  if (sessionId === currentSessionId) {
    const remainingSessions = Array.from(sessions.keys());
    currentSessionId = remainingSessions[0];
    loadCurrentSession();
  }
  
  updateTabsUI();
  saveSessions();
  updateChatHistory();
}

// Load chat history
async function loadChatHistory() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;
  
  historyList.innerHTML = '';
  
  // Sort sessions by update time
  const sortedSessions = Array.from(sessions.entries())
    .sort(([,a], [,b]) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  sortedSessions.forEach(([sessionId, session]) => {
    const historyItem = document.createElement('div');
    historyItem.className = `history-item ${sessionId === currentSessionId ? 'active' : ''}`;
    historyItem.dataset.sessionId = sessionId;
    
    const preview = session.messages.length > 0 
      ? session.messages[0].content.substring(0, 50) + '...'
      : 'New chat';
    
    const date = new Date(session.updatedAt).toLocaleDateString();
    
    historyItem.innerHTML = `
      <div class="history-item-title">${session.title}</div>
      <div class="history-item-preview">${preview}</div>
      <div class="history-item-date">${date}</div>
    `;
    
    historyItem.addEventListener('click', () => {
      switchToSession(sessionId);
      closeHistorySidebar();
    });
    
    historyList.appendChild(historyItem);
  });
}

// Update chat history
function updateChatHistory() {
  loadChatHistory();
}

// Setup event listeners
function setupEventListeners() {
  // Send button
  sendBtn.addEventListener('click', handleSend);
  
  // Enter key to send, ESC to stop
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isSessionProcessing(currentSessionId)) {
        handleSend();
      }
    } else if (e.key === 'Escape' && isSessionProcessing(currentSessionId)) {
      e.preventDefault();
      handleStopGeneration();
    }
  });
  
  // Global ESC key listener for stopping generation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isSessionProcessing(currentSessionId)) {
      e.preventDefault();
      handleStopGeneration();
    }
  });
  
  // Input change
  userInput.addEventListener('input', () => {
    sendBtn.disabled = !userInput.value.trim() || isSessionProcessing(currentSessionId);
    adjustTextareaHeight();
  });
  
  // Clear chat
  clearBtn.addEventListener('click', clearChat);
  
  // New chat button
  const newChatBtn = document.getElementById('newChatBtn');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', createNewChatSession);
  }
  
  // New tab button
  const newTabBtn = document.getElementById('newTabBtn');
  if (newTabBtn) {
    newTabBtn.addEventListener('click', createNewChatSession);
  }
  
  // History button
  const historyBtn = document.getElementById('historyBtn');
  if (historyBtn) {
    historyBtn.addEventListener('click', toggleHistorySidebar);
  }
  
  // Close history button
  const closeHistoryBtn = document.getElementById('closeHistoryBtn');
  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', closeHistorySidebar);
  }
  
  // History search
  const historySearch = document.getElementById('historySearch');
  if (historySearch) {
    historySearch.addEventListener('input', filterChatHistory);
  }
  
  // Suggestion chips
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion-chip')) {
      const suggestion = e.target.dataset.suggestion;
      if (suggestion) {
        userInput.value = suggestion;
        sendBtn.disabled = false;
        handleSend();
      }
    }
  });
  
  // Quick Action Buttons
  const attachPageBtn = document.getElementById('attachPageBtn');
  const attachSelectionBtn = document.getElementById('attachSelectionBtn');
  const smartSummarizeBtn = document.getElementById('smartSummarizeBtn');
  const translateBtn = document.getElementById('translateBtn');
  const improveTextBtn = document.getElementById('improveTextBtn');
  
  if (attachPageBtn) {
    attachPageBtn.addEventListener('click', handleAttachPage);
  }
  if (attachSelectionBtn) {
    attachSelectionBtn.addEventListener('click', handleAttachSelection);
  }
  if (smartSummarizeBtn) {
    smartSummarizeBtn.addEventListener('click', handleSmartSummarize);
  }
  if (translateBtn) {
    translateBtn.addEventListener('click', handleTranslate);
  }
  if (improveTextBtn) {
    improveTextBtn.addEventListener('click', handleImproveText);
  }
  
  // Check for text selection periodically and highlight relevant buttons + update labels
  setInterval(async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: 'getSelection' }, (response) => {
          if (chrome.runtime.lastError) {
            // Content script not loaded, buttons stay normal
            attachSelectionBtn?.classList.remove('has-selection');
            smartSummarizeBtn?.classList.remove('has-selection');
            translateBtn?.classList.remove('has-selection');
            improveTextBtn?.classList.remove('has-selection');
            // Reset button labels to default
            if (attachSelectionBtn) attachSelectionBtn.lastChild.textContent = 'Selection';
            if (smartSummarizeBtn) smartSummarizeBtn.lastChild.textContent = 'Summarize Page';
            if (translateBtn) translateBtn.lastChild.textContent = 'Translate Page';
            if (improveTextBtn) improveTextBtn.lastChild.textContent = 'Improve';
          } else if (response && response.text && response.text.trim()) {
            // Text is selected - highlight all buttons that work with selection
            attachSelectionBtn?.classList.add('has-selection');
            smartSummarizeBtn?.classList.add('has-selection');
            translateBtn?.classList.add('has-selection');
            improveTextBtn?.classList.add('has-selection');
            // Update button labels to show they'll use selection
            if (attachSelectionBtn) attachSelectionBtn.lastChild.textContent = 'Attach Selected';
            if (smartSummarizeBtn) smartSummarizeBtn.lastChild.textContent = 'Summarize Selected';
            if (translateBtn) translateBtn.lastChild.textContent = 'Translate Selected';
            if (improveTextBtn) improveTextBtn.lastChild.textContent = 'Improve Selected';
          } else {
            // No text selected - remove highlight
            attachSelectionBtn?.classList.remove('has-selection');
            smartSummarizeBtn?.classList.remove('has-selection');
            translateBtn?.classList.remove('has-selection');
            improveTextBtn?.classList.remove('has-selection');
            // Update button labels to show they'll use page
            if (attachSelectionBtn) attachSelectionBtn.lastChild.textContent = 'Selection';
            if (smartSummarizeBtn) smartSummarizeBtn.lastChild.textContent = 'Summarize Page';
            if (translateBtn) translateBtn.lastChild.textContent = 'Translate Page';
            if (improveTextBtn) improveTextBtn.lastChild.textContent = 'Improve';
          }
        });
      }
    } catch (error) {
      // Ignore errors (happens on chrome:// pages)
    }
  }, 500); // Check every 500ms
}

// Handle send
async function handleSend() {
  // Check if current session is already processing
  if (isSessionProcessing(currentSessionId)) {
    return; // Silently ignore - don't show error
  }
  
  const message = userInput.value.trim();
  if (!message) return;
  
  // Create abort controller for this request
  const abortController = new AbortController();
  
  // Create streaming data object for background processing
  const streamingData = {
    sessionId: currentSessionId,
    message: message,
    fullResponse: '',
    isComplete: false
  };
  
  // Set processing flag for current session only
  setSessionProcessing(currentSessionId, true, abortController, streamingData);
  
  // Hide welcome message if it exists
  const welcomeMessage = document.querySelector('.welcome-message');
  if (welcomeMessage) {
    welcomeMessage.style.display = 'none';
  }
  
  // Add user message
  addMessage(message, 'user');
  
  // Clear input
  userInput.value = '';
  adjustTextareaHeight();
  
  // Show loading initially
  const loadingId = showLoading();
  
  // Create streaming message container outside try block
  let streamingMessage = null;
  let fullResponse = '';
  
  try {
    let firstChunkReceived = false;
    
    // Start background streaming (UI-independent)
    const streamPromise = startBackgroundStream(message, streamingData.sessionId, abortController);
    
    // Store the active stream
    activeStreams.set(streamingData.sessionId, {
      promise: streamPromise,
      data: streamingData
    });
    
    // Handle UI for current session
    if (currentSessionId === streamingData.sessionId) {
      removeLoading(loadingId);
      streamingMessage = addStreamingMessage('bot');
      
      // Monitor the stream for UI updates
      monitorStreamForUI(streamingData.sessionId, streamingMessage);
    }
    
    // Wait for completion
    const response = await streamPromise;
    fullResponse = response;
    
    // Mark streaming as complete
    streamingData.isComplete = true;
    streamingData.fullResponse = fullResponse;
    
    // Clean up active stream
    activeStreams.delete(streamingData.sessionId);
    
    // If the completed session is currently active, finalize the streaming message
    if (currentSessionId === streamingData.sessionId) {
      // Find the streaming message for this session
      const streamingMessages = document.querySelectorAll('.message.bot.streaming');
      streamingMessages.forEach(msg => {
        if (msg.dataset.sessionId === streamingData.sessionId) {
          // Finalize this streaming message
          const contentDiv = msg.querySelector('.message-content');
          if (contentDiv) {
            // Remove streaming class and cursor
            msg.classList.remove('streaming');
            const cursor = contentDiv.querySelector('.streaming-cursor');
            if (cursor) cursor.remove();
            
            // Set final content with formatting
            const formattedContent = formatMessage(fullResponse);
            contentDiv.innerHTML = formattedContent;
            
            // Add message actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'message-actions';
            actionsDiv.innerHTML = `
              <button class="copy-btn" title="Copy message">📋 Copy</button>
              <button class="continue-btn" title="Continue response">➡️ Continue</button>
            `;
            contentDiv.appendChild(actionsDiv);
            
            // Set original content for saving
            msg.dataset.originalContent = fullResponse;
            
            // Add event listeners
            const copyBtn = actionsDiv.querySelector('.copy-btn');
            const continueBtn = actionsDiv.querySelector('.continue-btn');
            
            copyBtn.addEventListener('click', () => copyMessageToClipboard(fullResponse, copyBtn));
            continueBtn.addEventListener('click', () => continueResponse(fullResponse));
          }
        }
      });
    }
    
    // Handle completion based on current session
    if (currentSessionId === streamingData.sessionId) {
      if (streamingMessage) {
        streamingMessage.finalize(fullResponse);
      } else {
        removeLoading(loadingId);
        addMessage(response, 'bot');
      }
    } else {
      // Session switched - add message to correct session and update UI if we return
      const targetSession = sessions.get(streamingData.sessionId);
      if (targetSession) {
        targetSession.messages.push({
          type: 'bot',
          content: fullResponse,
          timestamp: new Date().toISOString()
        });
        targetSession.updatedAt = new Date().toISOString();
        sessions.set(streamingData.sessionId, targetSession);
        saveSessions();
        
        // If this session becomes current again, refresh to show completed message
        if (currentSessionId === streamingData.sessionId) {
          // Remove pending indicators
          const pendingMessages = document.querySelectorAll('.pending-response');
          pendingMessages.forEach(msg => msg.remove());
          
          // Add the completed message
          addMessage(fullResponse, 'bot');
        }
      }
    }
  } catch (error) {
    removeLoading(loadingId);
    
    // Handle abort separately
    if (error.name === 'AbortError') {
      // If we have a streaming message, finalize it as stopped
      if (streamingMessage && fullResponse) {
        streamingMessage.finalize(fullResponse, true);
      } else if (streamingMessage) {
        // Remove the streaming message if no content was received
        const streamingElem = document.querySelector('.message.streaming');
        if (streamingElem) streamingElem.remove();
      }
    } else {
      // Remove any streaming message on error
      const streamingElem = document.querySelector('.message.streaming');
      if (streamingElem) streamingElem.remove();
      
      showError('Failed to get response. Please try again.');
      console.error('Error processing message:', error);
    }
  } finally {
    // Clear processing state for current session
    setSessionProcessing(currentSessionId, false);
  }
}

// Process message with AI - with streaming support and cancellation
async function processMessage(message, onChunk, abortSignal, sessionId = currentSessionId) {
  let aiSession = null;
  
  try {
    aiSession = await getAvailableAISession();
    
    // Check if streaming is supported
    if (aiSession.promptStreaming) {
      // Use streaming API if available
      let fullResponse = '';
      const stream = aiSession.promptStreaming(message, { 
        language: 'en',
        signal: abortSignal // Pass abort signal if API supports it
      });
      
      for await (const chunk of stream) {
        // Check if aborted
        if (abortSignal?.aborted) {
          throw new DOMException('Generation stopped by user', 'AbortError');
        }
        
        fullResponse += chunk;
        if (onChunk) {
          onChunk(chunk); // Call callback with each chunk
        }
      }
      
      return fullResponse;
    } else {
      // Fallback to regular prompt if streaming not available
      const response = await aiSession.prompt(message, { 
        language: 'en',
        signal: abortSignal // Pass abort signal if API supports it
      });
      
      // Simulate streaming for better UX even without native support
      if (onChunk) {
        const words = response.split(' ');
        for (let i = 0; i < words.length; i++) {
          // Check if aborted during simulation
          if (abortSignal?.aborted) {
            throw new DOMException('Generation stopped by user', 'AbortError');
          }
          
          const word = words[i] + (i < words.length - 1 ? ' ' : '');
          onChunk(word);
          // Small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }
      
      return response;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Generation was stopped by user');
    } else {
      console.error('Failed to process message:', error);
    }
    throw error;
  } finally {
    // Release AI session back to pool
    if (aiSession) {
      releaseAISession(aiSession);
    }
  }
}


// Add message to chat
function addMessage(content, type) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar';
  avatarDiv.textContent = type === 'user' ? '👤' : '🤖';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  // Format message with enhanced markdown support
  contentDiv.innerHTML = formatMessage(content);
  
  // Store original content as data attribute for proper saving
  messageDiv.dataset.originalContent = content;
  
  // Add copy button for bot messages
  if (type === 'bot') {
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'message-actions';
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span>';
    copyBtn.title = 'Copy message';
    copyBtn.onclick = () => copyMessageToClipboard(content, copyBtn);
    
    const continueBtn = document.createElement('button');
    continueBtn.className = 'continue-btn';
    continueBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"></path></svg><span>Continue</span>';
    continueBtn.title = 'Continue response';
    continueBtn.onclick = () => continueResponse(content);
    
    actionsDiv.appendChild(copyBtn);
    actionsDiv.appendChild(continueBtn);
    contentDiv.appendChild(actionsDiv);
  }
  
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  
  // Save message to current session (but not if it's from streaming restoration)
  const session = sessions.get(currentSessionId);
  if (session && !messageDiv.classList.contains('streaming')) {
    session.messages.push({
      type: type,
      content: content,
      timestamp: new Date().toISOString()
    });
    session.updatedAt = new Date().toISOString();
    sessions.set(currentSessionId, session);
    saveSessions();
    
    // Update history in background
    setTimeout(() => updateChatHistory(), 100);
  }
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Add streaming message to chat
function addStreamingMessage(type = 'bot') {
  // Remove any existing streaming messages first to prevent duplicates
  const existingStreaming = document.querySelector('.message.streaming');
  if (existingStreaming) {
    existingStreaming.remove();
  }
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type} streaming`;
  messageDiv.id = 'streaming-' + Date.now();
  messageDiv.dataset.sessionId = currentSessionId; // Track which session this belongs to
  
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar';
  avatarDiv.textContent = type === 'user' ? '👤' : '🤖';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content streaming-content';
  
  // Add cursor for streaming effect directly (no stop button needed here)
  const cursorSpan = document.createElement('span');
  cursorSpan.className = 'streaming-cursor';
  cursorSpan.textContent = '▊';
  contentDiv.appendChild(cursorSpan);
  
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  return {
    element: messageDiv,  // Add element reference for tracking
    messageDiv,
    contentDiv,
    appendChunk: function(fullText) {
      // Remove cursor temporarily
      const cursor = contentDiv.querySelector('.streaming-cursor');
      if (cursor) cursor.remove();
      
      // Clear existing content and set the full text
      contentDiv.innerHTML = '';
      const textSpan = document.createElement('span');
      textSpan.textContent = fullText;
      contentDiv.appendChild(textSpan);
      
      // Re-add cursor
      contentDiv.appendChild(cursorSpan);
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    finalize: function(fullText, wasStopped = false) {
      // Remove cursor
      const cursor = contentDiv.querySelector('.streaming-cursor');
      if (cursor) cursor.remove();
      
      // Remove streaming class
      messageDiv.classList.remove('streaming');
      
      // Remove any background indicators since we now have the real message
      const backgroundIndicators = document.querySelectorAll('.background-indicator');
      backgroundIndicators.forEach(indicator => indicator.remove());
      
      // Store original content for proper saving
      messageDiv.dataset.originalContent = fullText || '';
      
      // Apply formatting to the complete text
      if (wasStopped && fullText) {
        contentDiv.innerHTML = formatMessage(fullText) + 
          '<div class="stopped-indicator">⏸ Response stopped by user</div>';
      } else if (fullText) {
        contentDiv.innerHTML = formatMessage(fullText);
      } else {
        contentDiv.innerHTML = '<div class="stopped-indicator">⏸ Response stopped</div>';
      }
      
      // Add copy and continue buttons for bot messages
      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'message-actions';
      
      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span>';
      copyBtn.title = 'Copy message';
      copyBtn.onclick = () => copyMessageToClipboard(fullText, copyBtn);
      
      const continueBtn = document.createElement('button');
      continueBtn.className = 'continue-btn';
      continueBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"></path></svg><span>Continue</span>';
      continueBtn.title = 'Continue response';
      continueBtn.onclick = () => continueResponse(fullText);
      
      actionsDiv.appendChild(copyBtn);
      actionsDiv.appendChild(continueBtn);
      contentDiv.appendChild(actionsDiv);
      
      // Save the completed message to the correct session (not necessarily current)
      const originalSessionId = messageDiv.dataset.sessionId || currentSessionId;
      const session = sessions.get(originalSessionId);
      if (session && fullText) {
        session.messages.push({
          type: 'bot',
          content: fullText,
          timestamp: new Date().toISOString()
        });
        session.updatedAt = new Date().toISOString();
        sessions.set(originalSessionId, session);
        saveSessions();
        
        // Update history
        setTimeout(() => updateChatHistory(), 100);
      }
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };
}

// Enhanced markdown formatting function
function formatMessage(text) {
  // Escape HTML first
  let formatted = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  // Code blocks (must be processed before inline code)
  formatted = formatted.replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
    const language = lang || '';
    return `<div class="code-block"><div class="code-header"><span class="code-lang">${language}</span><button class="copy-code-btn" onclick="copyCodeToClipboard(this)">Copy</button></div><pre><code class="language-${language}">${code.trim()}</code></pre></div>`;
  });
  
  // Inline code
  formatted = formatted.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  
  // Headers (with anchor links)
  formatted = formatted.replace(/^#### (.+)$/gm, '<h4 class="md-header">$1</h4>');
  formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="md-header">$1</h3>');
  formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="md-header">$1</h2>');
  formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="md-header">$1</h1>');
  
  // Bold and italic (handle nested formatting)
  formatted = formatted.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
  
  // Strikethrough
  formatted = formatted.replace(/~~(.+?)~~/g, '<del>$1</del>');
  
  // Links
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="md-link">$1</a>');
  
  // Blockquotes
  formatted = formatted.replace(/^> (.+)$/gm, '<blockquote class="md-blockquote">$1</blockquote>');
  
  // Unordered lists
  formatted = formatted.replace(/^[\*\-\+] (.+)$/gm, '<li class="md-list-item">$1</li>');
  
  // Ordered lists
  formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li class="md-list-item-ordered">$1</li>');
  
  // Wrap consecutive list items
  formatted = formatted.replace(/(<li class="md-list-item">.*?<\/li>)/gs, '<ul class="md-list">$1</ul>');
  formatted = formatted.replace(/(<li class="md-list-item-ordered">.*?<\/li>)/gs, '<ol class="md-list-ordered">$1</ol>');
  
  // Horizontal rules
  formatted = formatted.replace(/^---$/gm, '<hr class="md-hr">');
  
  // Tables (basic support)
  formatted = formatted.replace(/\|(.+)\|/g, (match, content) => {
    const cells = content.split('|').map(cell => `<td class="md-table-cell">${cell.trim()}</td>`).join('');
    return `<tr class="md-table-row">${cells}</tr>`;
  });
  
  // Wrap table rows
  formatted = formatted.replace(/(<tr class="md-table-row">.*?<\/tr>)/gs, '<table class="md-table">$1</table>');
  
  // Paragraphs (handle line breaks properly)
  const paragraphs = formatted.split(/\n\s*\n/).filter(p => p.trim());
  formatted = paragraphs.map(p => {
    p = p.replace(/\n/g, '<br>');
    // Don't wrap if already wrapped in block elements
    if (p.match(/^<(h[1-6]|div|blockquote|ul|ol|table|pre)/)) {
      return p;
    }
    return `<p class="md-paragraph">${p}</p>`;
  }).join('');
  
  return formatted;
}

// Show loading animation with timer, stop button, and skeleton
function showLoading() {
  const loadingId = 'loading-' + Date.now();
  const messageDiv = document.createElement('div');
  messageDiv.className = 'message bot';
  messageDiv.id = loadingId;
  
  const avatarDiv = document.createElement('div');
  avatarDiv.className = 'message-avatar';
  avatarDiv.textContent = '🤖';
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  
  // Create timer display without stop button (it's now in the send button position)
  const timerDiv = document.createElement('div');
  timerDiv.className = 'loading-timer';
  timerDiv.innerHTML = `
    <div class="timer-container">
      <span class="timer-icon">⏱️</span>
      <span class="timer-text">Processing...</span>
      <span class="timer-seconds">0s</span>
    </div>
    <div class="skeleton-container">
      <div class="skeleton-line skeleton-line-full"></div>
      <div class="skeleton-line skeleton-line-three-quarters"></div>
      <div class="skeleton-line skeleton-line-half"></div>
    </div>
    <div class="loading">
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
      <div class="loading-dot"></div>
    </div>
  `;
  contentDiv.appendChild(timerDiv);
  
  // Start timer
  let seconds = 0;
  const timerSpan = timerDiv.querySelector('.timer-seconds');
  
  const intervalId = setInterval(() => {
    seconds++;
    if (timerSpan) {
      timerSpan.textContent = `${seconds}s`;
    }
    
    // Update text based on time elapsed
    const timerText = timerDiv.querySelector('.timer-text');
    if (timerText) {
      if (seconds > 10) {
        timerText.textContent = 'Still thinking...';
      } else if (seconds > 5) {
        timerText.textContent = 'Analyzing...';
      }
    }
  }, 1000);
  
  // Store interval ID on the element for cleanup
  messageDiv.dataset.intervalId = intervalId;
  
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  return loadingId;
}

// Remove loading animation
function removeLoading(loadingId) {
  const loadingElement = document.getElementById(loadingId);
  if (loadingElement) {
    // Clear the timer interval if it exists
    const intervalId = loadingElement.dataset.intervalId;
    if (intervalId) {
      clearInterval(intervalId);
    }
    loadingElement.remove();
  }
}

// Show error message
function showError(message) {
  addMessage(`⚠️ ${message}`, 'bot');
}

// Clear chat
function clearChat() {
  // Clear current session messages
  const session = sessions.get(currentSessionId);
  if (session) {
    session.messages = [];
    session.updatedAt = new Date().toISOString();
    sessions.set(currentSessionId, session);
    saveSessions();
  }
  
  // Clear messages and show welcome message
  messagesContainer.innerHTML = '';
  const welcomeMessage = createWelcomeMessage();
  messagesContainer.appendChild(welcomeMessage);
  
  // Reset any ongoing processing state for current session
  if (isSessionProcessing(currentSessionId)) {
    const abortController = getSessionAbortController(currentSessionId);
    if (abortController) {
      abortController.abort();
    }
    setSessionProcessing(currentSessionId, false);
  }
  
  // Update history
  updateChatHistory();
}

// Disable/Enable all quick action buttons
function setButtonsDisabled(disabled) {
  const buttons = document.querySelectorAll('.quick-action-btn');
  buttons.forEach(btn => {
    btn.disabled = disabled;
    if (disabled) {
      btn.classList.add('disabled');
    } else {
      btn.classList.remove('disabled');
    }
  });
  
  // Don't touch send button here - it's managed by transform functions
}

// Transform send button to stop button
function transformToStopButton() {
  sendBtn.innerHTML = '<span class="stop-icon">⏹</span>';
  sendBtn.classList.add('stop-mode');
  sendBtn.title = 'Stop generation (ESC)';
  sendBtn.disabled = false; // Ensure stop button is enabled
  
  // Remove existing click listener and add stop handler
  const newSendBtn = sendBtn.cloneNode(true);
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
  sendBtn = newSendBtn; // Update reference
  
  sendBtn.addEventListener('click', handleStopGeneration);
  sendBtn.disabled = false; // Ensure stop button is enabled after cloning
}

// Transform stop button back to send button
function transformToSendButton() {
  sendBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  sendBtn.classList.remove('stop-mode');
  sendBtn.title = 'Send message';
  
  // Remove stop handler and restore send handler
  const newSendBtn = sendBtn.cloneNode(true);
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
  sendBtn = newSendBtn; // Update reference
  
  sendBtn.addEventListener('click', handleSend);
  sendBtn.disabled = !userInput.value.trim();
}

// Handle stop generation
function handleStopGeneration() {
  const abortController = getSessionAbortController(currentSessionId);
  if (abortController) {
    console.log('Stopping generation...');
    abortController.abort();
    
    // Also remove any loading elements
    const loadingElements = document.querySelectorAll('[id^="loading-"]');
    loadingElements.forEach(elem => {
      const intervalId = elem.dataset.intervalId;
      if (intervalId) {
        clearInterval(intervalId);
      }
      elem.remove();
    });
    
    // Clear processing state for current session
    setSessionProcessing(currentSessionId, false);
  }
}

// Update status
function updateStatus(text, type) {
  statusText.textContent = text;
  
  // Update dot color based on type
  if (type === 'success') {
    statusDot.style.background = '#34a853';
  } else if (type === 'warning') {
    statusDot.style.background = '#fbbc04';
  } else if (type === 'error') {
    statusDot.style.background = '#ea4335';
  } else {
    statusDot.style.background = '#9aa0a6';
  }
}

// Adjust textarea height
function adjustTextareaHeight() {
  userInput.style.height = 'auto';
  userInput.style.height = Math.min(userInput.scrollHeight, 100) + 'px';
}

// Listen for AI availability changes
if ('LanguageModel' in self) {
  LanguageModel.addEventListener?.('availabilitychange', async () => {
    await initializeAI();
  });
}
// Add to setupEventListeners function - Action chip handlers
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('action-chip')) {
    const action = e.target.dataset.action;
    if (action) {
      await handleActionChip(action);
    }
  }
});

// Handle action chip clicks
async function handleActionChip(action) {
  try {
    // Hide welcome message
    const welcomeMessage = document.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.style.display = 'none';
    }
    
    switch(action) {
      case 'summarize':
        await summarizePage();
        break;
      case 'explain-selection':
        await explainSelection();
        break;
      case 'explain-video':
        await explainVideo();
        break;
      default:
        console.log('Unknown action:', action);
    }
  } catch (error) {
    console.error('Error handling action:', error);
    showError('Failed to perform action. Please try again.');
  }
}

// Summarize current page
async function summarizePage() {
  isProcessing = true;
  addMessage('Please summarize this webpage for me', 'user');
  
  const loadingId = showLoading();
  
  try {
    // Get page content
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
    
    if (!response || !response.content) {
      throw new Error('Could not get page content');
    }
    
    // Create prompt for summarization
    const prompt = `Please provide a concise summary of this webpage content:

Title: ${tab.title}
URL: ${tab.url}

Content:
${response.content}

Provide a clear, structured summary with key points.`;
    
    const aiSession = await getAvailableAISession();
    let summary;
    try {
      summary = await aiSession.prompt(prompt, { language: 'en' });
    } finally {
      releaseAISession(aiSession);
    }
    
    removeLoading(loadingId);
    addMessage(summary, 'bot');
  } catch (error) {
    removeLoading(loadingId);
    showError('Failed to summarize page. Make sure you\'re on a webpage with content.');
    console.error('Summarize error:', error);
  } finally {
    isProcessing = false;
  }
}

// Explain selected text
async function explainSelection() {
  isProcessing = true;
  
  try {
    // Get selected text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
    
    if (!response || !response.text || response.text.trim() === '') {
      showError('Please select some text on the page first');
      isProcessing = false;
      return;
    }
    
    addMessage(`Explain this: "${response.text.substring(0, 100)}${response.text.length > 100 ? '...' : ''}"`, 'user');
    
    const loadingId = showLoading();
    
    const prompt = `Please explain the following text in simple terms:

"${response.text}"

Provide a clear explanation that's easy to understand.`;
    
    const aiSession = await getAvailableAISession();
    let explanation;
    try {
      explanation = await aiSession.prompt(prompt, { language: 'en' });
    } finally {
      releaseAISession(aiSession);
    }
    
    removeLoading(loadingId);
    addMessage(explanation, 'bot');
  } catch (error) {
    showError('Failed to explain selection. Please try again.');
    console.error('Explain selection error:', error);
  } finally {
    isProcessing = false;
  }
}

// Explain intro video
async function explainVideo() {
  isProcessing = true;
  addMessage('Find and explain the intro video on this page', 'user');
  
  const loadingId = showLoading();
  
  try {
    // Find videos on page
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'findVideos' });
    
    if (!response || !response.videos || response.videos.length === 0) {
      removeLoading(loadingId);
      addMessage('No videos found on this page. If there is a video, it might be loaded dynamically or embedded in a way that\'s not detectable.', 'bot');
      isProcessing = false;
      return;
    }
    
    const video = response.videos[0];
    const prompt = `This page "${tab.title}" has a ${video.type} video titled "${video.title}".
URL: ${tab.url}

Based on the page context and typical intro videos, please explain what this video likely covers and its purpose. Provide insights about what viewers can expect to learn.`;
    
    const aiSession = await getAvailableAISession();
    let explanation;
    try {
      explanation = await aiSession.prompt(prompt, { language: 'en' });
    } finally {
      releaseAISession(aiSession);
    }
    
    removeLoading(loadingId);
    addMessage(explanation, 'bot');
  } catch (error) {
    removeLoading(loadingId);
    showError('Failed to analyze video. Please try again.');
    console.error('Explain video error:', error);
  } finally {
    isProcessing = false;
  }
}

// Quick Action Button Handlers

// Handle Attach Page Content
async function handleAttachPage() {
  try {
    // Visual feedback
    document.getElementById('attachPageBtn').classList.add('active');
    
    // Execute function to get page content
    const result = await window.functionHandler.executeFunction('getPageContent', { 
      includeMetadata: true 
    });
    
    // Format the result as a message
    const attachmentText = `

[Attached Page Content]
**Page:** ${result.metadata?.title || 'Untitled'}
**URL:** ${result.metadata?.url || 'Unknown'}
**Content Preview:** ${result.content?.substring(0, 500)}${result.content?.length > 500 ? '...' : ''}
`;
    
    // APPEND to existing text, don't replace
    const currentText = userInput.value;
    const newText = currentText + (currentText && !currentText.endsWith('\n') ? '\n' : '') + attachmentText;
    userInput.value = newText;
    
    // Move cursor to end
    userInput.setSelectionRange(userInput.value.length, userInput.value.length);
    userInput.focus();
    
    sendBtn.disabled = false;
    adjustTextareaHeight();
    
    // Remove active state after a moment
    setTimeout(() => {
      document.getElementById('attachPageBtn').classList.remove('active');
    }, 1000);
    
  } catch (error) {
    console.error('Failed to attach page content:', error);
    showError('Failed to get page content. Make sure you\'re on a regular webpage.');
  }
}

// Handle Attach Selection
async function handleAttachSelection() {
  try {
    // Visual feedback
    document.getElementById('attachSelectionBtn').classList.add('active');
    
    // Get selected text
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
    
    if (!response || !response.text || response.text.trim() === '') {
      showError('Please select some text on the page first');
      document.getElementById('attachSelectionBtn').classList.remove('active');
      return;
    }
    
    // Format attachment
    const attachmentText = `

[Attached Selection]
"${response.text}"
`;
    
    // APPEND to existing text
    const currentText = userInput.value;
    const newText = currentText + (currentText && !currentText.endsWith('\n') ? '\n' : '') + attachmentText;
    userInput.value = newText;
    
    // Move cursor to end
    userInput.setSelectionRange(userInput.value.length, userInput.value.length);
    userInput.focus();
    
    sendBtn.disabled = false;
    adjustTextareaHeight();
    
    // Remove active state
    setTimeout(() => {
      document.getElementById('attachSelectionBtn').classList.remove('active');
    }, 1000);
    
  } catch (error) {
    console.error('Failed to get selection:', error);
    showError('Failed to get selected text. Please try selecting text and clicking again.');
  }
}

// Handle Smart Summarize with Chrome's Summarizer API
async function handleSmartSummarize() {
  try {
    // Check if current session is already processing
    if (isSessionProcessing(currentSessionId)) {
      console.log('Already processing a request. Please wait...');
      return;
    }
    
    // Create abort controller for this request
    const abortController = new AbortController();
    
    // Set processing flag for current session
    setSessionProcessing(currentSessionId, true, abortController);
    
    // Visual feedback
    document.getElementById('smartSummarizeBtn').classList.add('active');
    
    // First check if text is selected
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const selection = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
    
    let contentToSummarize = '';
    let contentLabel = '';
    
    // Show loading message with spinner
    const loadingId = showLoading();
    
    if (selection && selection.text && selection.text.trim()) {
      // Use selected text
      contentToSummarize = selection.text;
      contentLabel = 'Selected Text';
      addMessage(`⏳ Summarizing selected text...`, 'bot');
    } else {
      // Use page content
      const result = await window.functionHandler.executeFunction('getPageContent', { 
        includeMetadata: true 
      });
      contentToSummarize = result.content;
      contentLabel = result.metadata?.title || 'Page Content';
      addMessage(`⏳ Summarizing page content...`, 'bot');
    }
    
    // Remove the loading indicator
    removeLoading(loadingId);
    
    // Try Chrome's Summarizer API if available
    if (window.chromeAI) {
      const summary = await window.chromeAI.smartSummarize(contentToSummarize);
      
      // Remove the loading message before showing result
      const messages = document.getElementById('messages');
      const lastMessage = messages.lastElementChild;
      if (lastMessage && lastMessage.textContent.includes('⏳ Summarizing')) {
        lastMessage.remove();
      }
      
      if (summary && !summary.includes('Summarize this:')) {
        // Native API worked
        const message = `📝 **Summary of ${contentLabel}:**\n\n${summary}`;
        addMessage(message, 'bot');
      } else {
        // Fallback to regular AI - auto send
        const message = `Please provide a concise summary of this:\n\n[${contentLabel}]\n"${contentToSummarize.substring(0, 800)}..."`;
        userInput.value = message;
        sendBtn.disabled = false;
        setTimeout(() => {
          handleSend();
        }, 100);
      }
    } else {
      // Remove loading message before fallback
      const messages = document.getElementById('messages');
      const lastMessage = messages.lastElementChild;
      if (lastMessage && lastMessage.textContent.includes('⏳ Summarizing')) {
        lastMessage.remove();
      }
      
      // Fallback to regular AI
      const message = `Please summarize this:\n\n[${contentLabel}]\n"${contentToSummarize.substring(0, 800)}..."`;
      userInput.value = message;
      sendBtn.disabled = false;
      adjustTextareaHeight();
    }
    
    // Remove active state and re-enable buttons
    setTimeout(() => {
      document.getElementById('smartSummarizeBtn').classList.remove('active');
      setSessionProcessing(currentSessionId, false);
    }, 1000);
    
  } catch (error) {
    console.error('Failed to summarize:', error);
    showError('Summarization failed. Try selecting text or using the Attach Page button.');
    // Re-enable buttons on error
    document.getElementById('smartSummarizeBtn').classList.remove('active');
    setSessionProcessing(currentSessionId, false);
  }
}

// Handle Translate with Chrome's Translator API
async function handleTranslate() {
  try {
    // Check if current session is already processing
    if (isSessionProcessing(currentSessionId)) {
      console.log('Already processing a request. Please wait...');
      return;
    }
    
    // Create abort controller for this request
    const abortController = new AbortController();
    
    // Set processing flag for current session
    setSessionProcessing(currentSessionId, true, abortController);
    
    // Visual feedback
    document.getElementById('translateBtn').classList.add('active');
    
    // First check if text is selected
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const selection = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
    
    let contentToTranslate = '';
    let contentLabel = '';
    
    if (selection && selection.text && selection.text.trim()) {
      // Use selected text
      contentToTranslate = selection.text;
      contentLabel = 'Selected Text';
      addMessage(`⏳ Translating selected text to Spanish...`, 'bot');
    } else {
      // Use page content
      const result = await window.functionHandler.executeFunction('getPageContent', { 
        includeMetadata: false 
      });
      contentToTranslate = result.content?.substring(0, 500) || '';
      contentLabel = 'Page Content';
      addMessage(`⏳ Translating page content to Spanish...`, 'bot');
    }
    
    // Try Chrome's Translator API if available
    if (window.chromeAI) {
      const translated = await window.chromeAI.translateContent(contentToTranslate, 'es');
      
      // Remove the loading message before showing result
      const messages = document.getElementById('messages');
      const lastMessage = messages.lastElementChild;
      if (lastMessage && lastMessage.textContent.includes('⏳ Translating')) {
        lastMessage.remove();
      }
      
      if (translated) {
        // API worked! Show translation
        addMessage(`🌐 **Translation (Spanish) of ${contentLabel}:**\n\n${translated}`, 'bot');
      } else {
        // API not available - use regular AI for translation
        const message = `Please translate this text to Spanish:\n\n[${contentLabel}]\n"${contentToTranslate.substring(0, 400)}..."`;
        
        // Set the message in input and auto-send
        userInput.value = message;
        sendBtn.disabled = false;
        
        // Auto-send the translation request
        setTimeout(() => {
          handleSend();
        }, 100);
      }
    } else {
      // Remove loading message before fallback
      const messages = document.getElementById('messages');
      const lastMessage = messages.lastElementChild;
      if (lastMessage && lastMessage.textContent.includes('⏳ Translating')) {
        lastMessage.remove();
      }
      
      // No Chrome AI available - fallback
      const message = `Please translate this to Spanish:\n\n[${contentLabel}]\n"${contentToTranslate.substring(0, 400)}..."`;
      userInput.value = message;
      sendBtn.disabled = false;
      adjustTextareaHeight();
    }
    
    // Remove active state and re-enable buttons
    setTimeout(() => {
      document.getElementById('translateBtn').classList.remove('active');
      setSessionProcessing(currentSessionId, false);
    }, 1000);
    
  } catch (error) {
    console.error('Failed to translate:', error);
    showError('Translation failed. Try selecting text or copying and asking the AI.');
    // Re-enable buttons on error
    document.getElementById('translateBtn').classList.remove('active');
    setSessionProcessing(currentSessionId, false);
  }
}

// Handle Improve Text with Chrome's Rewriter API
async function handleImproveText() {
  try {
    // Check if current session is already processing
    if (isSessionProcessing(currentSessionId)) {
      console.log('Already processing a request. Please wait...');
      return;
    }
    
    // Create abort controller for this request
    const abortController = new AbortController();
    
    // Set processing flag for current session
    setSessionProcessing(currentSessionId, true, abortController);
    
    // Visual feedback
    document.getElementById('improveTextBtn').classList.add('active');
    
    // Get selected text first
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
    
    if (!response || !response.text || response.text.trim() === '') {
      showError('Please select some text first to improve');
      document.getElementById('improveTextBtn').classList.remove('active');
      setButtonsDisabled(false);
      userInput.disabled = false;
      isProcessing = false;
      return;
    }
    
    // Show loading message
    addMessage(`⏳ Improving selected text...`, 'bot');
    
    // Use Chrome's Rewriter API if available
    if (window.chromeAI) {
      const improved = await window.chromeAI.improveText(response.text);
      
      // Remove the loading message before showing result
      const messages = document.getElementById('messages');
      const lastMessage = messages.lastElementChild;
      if (lastMessage && lastMessage.textContent.includes('⏳ Improving')) {
        lastMessage.remove();
      }
      
      if (improved) {
        const message = `✨ **Improved Text:**\n\n${improved}\n\n**Original:** ${response.text.substring(0, 200)}${response.text.length > 200 ? '...' : ''}`;
        addMessage(message, 'bot');
      } else {
        // Fallback to regular AI
        const message = `Please improve this text (make it clearer and more professional):\n\n"${response.text}"`;
        userInput.value = message;
        sendBtn.disabled = false;
        setTimeout(() => {
          handleSend();
        }, 100);
      }
    } else {
      // Remove loading message before fallback
      const messages = document.getElementById('messages');
      const lastMessage = messages.lastElementChild;
      if (lastMessage && lastMessage.textContent.includes('⏳ Improving')) {
        lastMessage.remove();
      }
      
      // Fallback - ask AI to improve
      const message = `Please improve this text (make it clearer and more professional):\n\n"${response.text}"`;
      userInput.value = message;
      sendBtn.disabled = false;
      adjustTextareaHeight();
    }
    
    // Remove active state and re-enable buttons
    setTimeout(() => {
      document.getElementById('improveTextBtn').classList.remove('active');
      setButtonsDisabled(false);
      userInput.disabled = false;
      isProcessing = false;
    }, 1000);
    
  } catch (error) {
    console.error('Failed to improve text:', error);
    showError('Text improvement not available. Select text and try the regular chat.');
    // Re-enable buttons on error
    document.getElementById('improveTextBtn').classList.remove('active');
    setButtonsDisabled(false);
    userInput.disabled = false;
    isProcessing = false;
  }
}

// Copy message to clipboard
async function copyMessageToClipboard(content, button) {
  try {
    await navigator.clipboard.writeText(content);
    
    // Visual feedback
    const originalHTML = button.innerHTML;
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg><span>Copied!</span>';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = originalHTML;
      button.classList.remove('copied');
    }, 2000);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = content;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    
    // Show feedback
    button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"></path></svg><span>Copied!</span>';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2 2v1"></path></svg><span>Copy</span>';
      button.classList.remove('copied');
    }, 2000);
  }
}

// Copy code block to clipboard
async function copyCodeToClipboard(button) {
  const codeBlock = button.closest('.code-block');
  const code = codeBlock.querySelector('code').textContent;
  
  try {
    await navigator.clipboard.writeText(code);
    
    // Visual feedback
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('copied');
    }, 2000);
  } catch (error) {
    console.error('Failed to copy code:', error);
    button.textContent = 'Failed';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 2000);
  }
}

// Continue response functionality
async function continueResponse(previousContent) {
  if (isSessionProcessing(currentSessionId)) {
    return;
  }
  
  // Create abort controller
  const abortController = new AbortController();
  
  // Set processing flag for current session
  setSessionProcessing(currentSessionId, true, abortController);
  
  // Add user message indicating continuation
  addMessage('Continue the previous response...', 'user');
  
  // Show loading
  const loadingId = showLoading();
  
  let streamingMessage = null;
  let fullResponse = '';
  
  try {
    let firstChunkReceived = false;
    
    // Create continuation prompt
    const continuePrompt = `Please continue from where you left off in your previous response. Here's what you said so far:\n\n${previousContent}\n\nPlease continue naturally from this point.`;
    
    const response = await processMessage(continuePrompt, (chunk) => {
      if (!firstChunkReceived) {
        removeLoading(loadingId);
        streamingMessage = addStreamingMessage('bot');
        firstChunkReceived = true;
      }
      
      if (streamingMessage) {
        streamingMessage.appendChunk(chunk);
        fullResponse += chunk;
      }
    }, abortController.signal, currentSessionId);
    
    if (!firstChunkReceived) {
      removeLoading(loadingId);
      addMessage(response, 'bot');
    } else if (streamingMessage && fullResponse) {
      streamingMessage.finalize(fullResponse);
    }
  } catch (error) {
    removeLoading(loadingId);
    
    if (error.name === 'AbortError') {
      if (streamingMessage && fullResponse) {
        streamingMessage.finalize(fullResponse, true);
      } else if (streamingMessage) {
        const streamingElem = document.querySelector('.message.streaming');
        if (streamingElem) streamingElem.remove();
      }
    } else {
      const streamingElem = document.querySelector('.message.streaming');
      if (streamingElem) streamingElem.remove();
      showError('Failed to continue response. Please try again.');
      console.error('Error continuing response:', error);
    }
  } finally {
    // Clear processing state for current session
    setSessionProcessing(currentSessionId, false);
  }
}

// Create new chat session
function createNewChatSession() {
  // Save current session first
  saveCurrentSessionState();
  
  // Create new session
  const newSession = createNewSession();
  currentSessionId = newSession.id;
  
  // Update UI
  updateTabsUI();
  loadCurrentSession();
  updateChatHistory();
  
  // Ensure UI is properly reset for new session
  const isNewSessionProcessing = isSessionProcessing(newSession.id);
  updateUIForProcessingState(isNewSessionProcessing);
  
  // Clear input and focus
  userInput.value = '';
  adjustTextareaHeight();
  userInput.focus();
  
  // Force update send button state for new session
  setTimeout(() => {
    if (!isSessionProcessing(currentSessionId)) {
      sendBtn.disabled = !userInput.value.trim();
    }
  }, 50);
}

// Toggle history sidebar
function toggleHistorySidebar() {
  const sidebar = document.getElementById('historySidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
    if (sidebar.classList.contains('open')) {
      updateChatHistory();
    }
  }
}

// Close history sidebar
function closeHistorySidebar() {
  const sidebar = document.getElementById('historySidebar');
  if (sidebar) {
    sidebar.classList.remove('open');
  }
}

// Filter chat history
function filterChatHistory() {
  const searchTerm = document.getElementById('historySearch').value.toLowerCase();
  const historyItems = document.querySelectorAll('.history-item');
  
  historyItems.forEach(item => {
    const title = item.querySelector('.history-item-title').textContent.toLowerCase();
    const preview = item.querySelector('.history-item-preview').textContent.toLowerCase();
    
    if (title.includes(searchTerm) || preview.includes(searchTerm)) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Debug function to verify parallel processing (can be called from console)
window.debugParallelChats = function() {
  console.log('=== Parallel Chat Debug Info ===');
  console.log('Current Session ID:', currentSessionId);
  console.log('Total Chat Sessions:', sessions.size);
  console.log('AI Session Pool Size:', aiSessionPool.length);
  console.log('Max Pool Size:', maxPoolSize);
  console.log('Processing States:');
  
  sessionProcessingStates.forEach((state, sessionId) => {
    console.log(`  Session ${sessionId}: Processing = ${state.isProcessing}`);
  });
  
  console.log('Chat Sessions:');
  sessions.forEach((session, sessionId) => {
    const isProcessing = isSessionProcessing(sessionId);
    const messageCount = session.messages ? session.messages.length : 0;
    console.log(`  Session ${sessionId} (${session.title}): ${messageCount} messages, Processing: ${isProcessing}`);
  });
  
  console.log('AI Session Pool:');
  aiSessionPool.forEach((aiSession, index) => {
    console.log(`  Pool[${index}]: ${aiSession ? (aiSession.busy ? 'Busy' : 'Available') : 'Null'}`);
  });
  
  console.log('=== End Debug Info ===');
};

// Setup main navigation tabs (Chat and Mail Compose)
function setupMainNavigation() {
  const mainNavTabs = document.querySelectorAll('.main-nav-tab');
  const chatSection = document.getElementById('chatSection');
  const mailSection = document.getElementById('mailSection');
  
  if (!mainNavTabs.length || !chatSection || !mailSection) {
    console.warn('Main navigation elements not found');
    return;
  }

  mainNavTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      mainNavTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show/hide sections
      if (targetTab === 'chat') {
        chatSection.style.display = 'flex';
        mailSection.style.display = 'none';
        
        // Cleanup mail AI resources when leaving mail tab
        if (typeof cleanupMailAI === 'function') {
          cleanupMailAI();
        }
        
        // Update header actions visibility for chat
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
          headerActions.style.display = 'flex';
        }
      } else if (targetTab === 'mail') {
        chatSection.style.display = 'none';
        mailSection.style.display = 'flex';
        
        // Initialize mail AI when entering mail tab
        if (typeof initializeMailAI === 'function') {
          initializeMailAI().then(initialized => {
            // Update AI status indicator with API info
            if (typeof updateAIStatus === 'function') {
              const apiName = window.lastUsedAPI || (typeof getCurrentAPIName === 'function' ? getCurrentAPIName() : null);
              updateAIStatus(initialized, apiName);
            }
          });
        }
        
        // Hide chat-specific header actions for mail compose
        const headerActions = document.querySelector('.header-actions');
        if (headerActions) {
          headerActions.style.display = 'none';
        }
      }
    });
  });
}

