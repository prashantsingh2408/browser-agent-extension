/* global LanguageModel */

// Function handler will be available from functions.js

// DOM Elements
const messagesContainer = document.getElementById('messages');
const userInput = document.getElementById('userInput');
let sendBtn = document.getElementById('sendBtn');
const clearBtn = document.getElementById('clearBtn');
const statusText = document.getElementById('statusText');
const statusDot = document.querySelector('.status-dot');

// AI Session
let aiSession = null;
let isProcessing = false;
let conversationHistory = [];
let currentAbortController = null; // For canceling ongoing requests

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await initializeAI();
  setupEventListeners();
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

// Create or get AI session
async function createAISession() {
  try {
    if (!aiSession) {
      console.log('Creating AI session...');
      
      if (!('LanguageModel' in self)) {
        throw new Error('LanguageModel API not available');
      }
      
      updateStatus('Loading model...', 'warning');
      
      // Simple system prompt without function calling
      const systemPrompt = `You are a helpful, friendly, and knowledgeable AI assistant. Provide clear, concise, and accurate responses. You can help analyze content that users share with you.`;

      aiSession = await LanguageModel.create({
        temperature: 0.7,
        topK: 3,
        language: 'en',
        systemPrompt: systemPrompt
      });
      
      console.log('AI session created successfully');
      updateStatus('Online', 'success');
    }
    return aiSession;
  } catch (error) {
    console.error('Failed to create AI session:', error);
    aiSession = null;
    updateStatus('Offline', 'error');
    throw error;
  }
}

// Setup event listeners
function setupEventListeners() {
  // Send button
  sendBtn.addEventListener('click', handleSend);
  
  // Enter key to send, ESC to stop
  userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isProcessing) {
        handleSend();
      }
    } else if (e.key === 'Escape' && isProcessing) {
      e.preventDefault();
      handleStopGeneration();
    }
  });
  
  // Global ESC key listener for stopping generation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isProcessing) {
      e.preventDefault();
      handleStopGeneration();
    }
  });
  
  // Input change
  userInput.addEventListener('input', () => {
    sendBtn.disabled = !userInput.value.trim() || isProcessing;
    adjustTextareaHeight();
  });
  
  // Clear chat
  clearBtn.addEventListener('click', clearChat);
  
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
  // Check if already processing
  if (isProcessing) {
    return; // Silently ignore - don't show error
  }
  
  const message = userInput.value.trim();
  if (!message) return;
  
  // Set processing flag and disable ALL inputs
  isProcessing = true;
  userInput.disabled = true;
  setButtonsDisabled(true);
  
  // Transform send button to stop button
  transformToStopButton();
  
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
  const loadingStartTime = Date.now();
  
  // Create abort controller for this request
  currentAbortController = new AbortController();
  
  // Create streaming message container outside try block
  let streamingMessage = null;
  let fullResponse = '';
  
  try {
    let firstChunkReceived = false;
    
    // Process with streaming
    const response = await processMessage(message, (chunk) => {
      // Remove loading on first chunk (with minimum display time)
      if (!firstChunkReceived) {
        removeLoading(loadingId);
        streamingMessage = addStreamingMessage('bot');
        firstChunkReceived = true;
      }
      
      // Append chunk to streaming message
      if (streamingMessage) {
        streamingMessage.appendChunk(chunk);
        fullResponse += chunk;
      }
    }, currentAbortController.signal);
    
    // If no streaming happened (fallback to regular response)
    if (!firstChunkReceived) {
      removeLoading(loadingId);
      addMessage(response, 'bot');
    } else if (streamingMessage && fullResponse) {
      // Finalize the streaming message with formatted content
      streamingMessage.finalize(fullResponse);
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
    // Clear abort controller
    currentAbortController = null;
    // Reset processing state and re-enable inputs
    isProcessing = false;
    userInput.disabled = false;
    setButtonsDisabled(false);
    // Transform button back to send
    transformToSendButton();
  }
}

// Process message with AI - with streaming support and cancellation
async function processMessage(message, onChunk, abortSignal) {
  try {
    const session = await createAISession();
    
    // Check if streaming is supported
    if (session.promptStreaming) {
      // Use streaming API if available
      let fullResponse = '';
      const stream = session.promptStreaming(message, { 
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
      const response = await session.prompt(message, { 
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
  
  // Format message with basic markdown support
  contentDiv.innerHTML = formatMessage(content);
  
  messageDiv.appendChild(avatarDiv);
  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  
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
    messageDiv,
    contentDiv,
    appendChunk: function(chunk) {
      // Remove cursor temporarily
      const cursor = contentDiv.querySelector('.streaming-cursor');
      if (cursor) cursor.remove();
      
      // Append the new chunk
      const textSpan = document.createElement('span');
      textSpan.textContent = chunk;
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
      
      // Apply formatting to the complete text
      if (wasStopped && fullText) {
        contentDiv.innerHTML = formatMessage(fullText) + 
          '<div class="stopped-indicator">⏸ Response stopped by user</div>';
      } else if (fullText) {
        contentDiv.innerHTML = formatMessage(fullText);
      } else {
        contentDiv.innerHTML = '<div class="stopped-indicator">⏸ Response stopped</div>';
      }
      
      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };
}

// Format message with basic markdown
function formatMessage(text) {
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
  
  // Line breaks
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = '<p>' + formatted + '</p>';
  
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
  // Keep welcome message if it exists
  const welcomeMessage = document.querySelector('.welcome-message');
  messagesContainer.innerHTML = '';
  if (welcomeMessage) {
    messagesContainer.appendChild(welcomeMessage);
    welcomeMessage.style.display = 'flex';
  }
  
  // Reset any ongoing processing state
  if (isProcessing) {
    isProcessing = false;
    userInput.disabled = false;
    setButtonsDisabled(false);
    transformToSendButton();
    
    // Abort any ongoing request
    if (currentAbortController) {
      currentAbortController.abort();
      currentAbortController = null;
    }
  }
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
  
  // Remove existing click listener and add stop handler
  const newSendBtn = sendBtn.cloneNode(true);
  sendBtn.parentNode.replaceChild(newSendBtn, sendBtn);
  sendBtn = newSendBtn; // Update reference
  
  sendBtn.addEventListener('click', handleStopGeneration);
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
  if (currentAbortController) {
    console.log('Stopping generation...');
    currentAbortController.abort();
    currentAbortController = null;
    
    // Also remove any loading elements
    const loadingElements = document.querySelectorAll('[id^="loading-"]');
    loadingElements.forEach(elem => {
      const intervalId = elem.dataset.intervalId;
      if (intervalId) {
        clearInterval(intervalId);
      }
      elem.remove();
    });
    
    // Re-enable inputs and transform button back
    isProcessing = false;
    userInput.disabled = false;
    setButtonsDisabled(false);
    transformToSendButton();
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
    
    const session = await createAISession();
    const summary = await session.prompt(prompt, { language: 'en' });
    
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
    
    const session = await createAISession();
    const explanation = await session.prompt(prompt, { language: 'en' });
    
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
    
    const session = await createAISession();
    const explanation = await session.prompt(prompt, { language: 'en' });
    
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
    // Check if already processing
    if (isProcessing) {
      console.log('Already processing a request. Please wait...');
      return;
    }
    
    // Set processing flag
    isProcessing = true;
    
    // Disable all buttons during processing
    setButtonsDisabled(true);
    userInput.disabled = true;
    
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
      setButtonsDisabled(false);
      userInput.disabled = false;
      isProcessing = false;
    }, 1000);
    
  } catch (error) {
    console.error('Failed to summarize:', error);
    showError('Summarization failed. Try selecting text or using the Attach Page button.');
    // Re-enable buttons on error
    document.getElementById('smartSummarizeBtn').classList.remove('active');
    setButtonsDisabled(false);
    userInput.disabled = false;
    isProcessing = false;
  }
}

// Handle Translate with Chrome's Translator API
async function handleTranslate() {
  try {
    // Check if already processing
    if (isProcessing) {
      console.log('Already processing a request. Please wait...');
      return;
    }
    
    // Set processing flag
    isProcessing = true;
    
    // Disable all buttons during processing
    setButtonsDisabled(true);
    userInput.disabled = true;
    
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
      setButtonsDisabled(false);
      userInput.disabled = false;
      isProcessing = false;
    }, 1000);
    
  } catch (error) {
    console.error('Failed to translate:', error);
    showError('Translation failed. Try selecting text or copying and asking the AI.');
    // Re-enable buttons on error
    document.getElementById('translateBtn').classList.remove('active');
    setButtonsDisabled(false);
    userInput.disabled = false;
    isProcessing = false;
  }
}

// Handle Improve Text with Chrome's Rewriter API
async function handleImproveText() {
  try {
    // Check if already processing
    if (isProcessing) {
      console.log('Already processing a request. Please wait...');
      return;
    }
    
    // Set processing flag
    isProcessing = true;
    
    // Disable all buttons during processing
    setButtonsDisabled(true);
    userInput.disabled = true;
    
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

