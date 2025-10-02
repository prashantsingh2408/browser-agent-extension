// Web Content Capture System
// Captures text selections, prompts, YouTube segments, and other web content

// Initialize web capture functionality
function initializeWebCapture() {
  console.log('🌐 Initializing Web Content Capture...');
  
  // Setup context menu for text selection
  setupTextSelectionCapture();
  
  // Setup YouTube video capture
  setupYouTubeCapture();
  
  // Setup prompt capture
  setupPromptCapture();
  
  // Setup page content capture
  setupPageCapture();
}

// ============================================
// TEXT SELECTION CAPTURE
// ============================================

function setupTextSelectionCapture() {
  // Listen for text selection
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection);
}

function handleTextSelection() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 10) { // Only show for meaningful selections
    showTextCapturePopup(selectedText, selection);
  } else {
    hideTextCapturePopup();
  }
}

function showTextCapturePopup(text, selection) {
  // Remove existing popup
  hideTextCapturePopup();
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  const popup = document.createElement('div');
  popup.id = 'textCapturePopup';
  popup.className = 'web-capture-popup';
  popup.style.cssText = `
    position: fixed;
    top: ${rect.bottom + window.scrollY + 10}px;
    left: ${rect.left + window.scrollX}px;
    background: #4285f4;
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  `;
  popup.innerHTML = '💾 Save to Memory Agent';
  
  popup.onclick = () => {
    captureSelectedText(text);
    hideTextCapturePopup();
  };
  
  document.body.appendChild(popup);
  
  // Auto-hide after 5 seconds
  setTimeout(hideTextCapturePopup, 5000);
}

function hideTextCapturePopup() {
  const popup = document.getElementById('textCapturePopup');
  if (popup) {
    popup.remove();
  }
}

function captureSelectedText(text) {
  const pageTitle = document.title;
  const pageUrl = window.location.href;
  const timestamp = Date.now();
  
  const memory = {
    id: 'web_' + timestamp,
    title: `📄 Web Selection: ${pageTitle.substring(0, 50)}...`,
    content: text,
    category: 'web',
    tags: ['web selection', 'text', 'browsing', getWebsiteDomain()],
    type: 'text',
    metadata: {
      source: 'web_selection',
      url: pageUrl,
      pageTitle: pageTitle,
      timestamp: timestamp,
      selectionLength: text.length
    }
  };
  
  saveWebMemory(memory);
  showCaptureNotification('Text saved to Memory Agent! 📄');
}

// ============================================
// YOUTUBE VIDEO CAPTURE
// ============================================

function setupYouTubeCapture() {
  if (window.location.hostname.includes('youtube.com')) {
    addYouTubeCaptureButton();
    setupYouTubeTimeCapture();
  }
}

function addYouTubeCaptureButton() {
  // Wait for YouTube player to load
  setTimeout(() => {
    const controls = document.querySelector('.ytp-chrome-controls');
    if (controls && !document.getElementById('memoryAgentYTBtn')) {
      const button = document.createElement('button');
      button.id = 'memoryAgentYTBtn';
      button.className = 'ytp-button';
      button.title = 'Save to Memory Agent';
      button.innerHTML = '💾';
      button.style.cssText = `
        font-size: 16px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0 8px;
      `;
      
      button.onclick = captureYouTubeVideo;
      controls.appendChild(button);
    }
  }, 2000);
}

function setupYouTubeTimeCapture() {
  // Listen for keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      captureYouTubeSegment();
    }
  });
}

function captureYouTubeVideo() {
  const video = document.querySelector('video');
  const title = document.querySelector('#title h1')?.textContent || 'YouTube Video';
  const channel = document.querySelector('#channel-name a')?.textContent || 'Unknown Channel';
  const currentTime = video ? Math.floor(video.currentTime) : 0;
  const duration = video ? Math.floor(video.duration) : 0;
  
  const memory = {
    id: 'youtube_' + Date.now(),
    title: `🎥 ${title}`,
    content: `Video from ${channel}\n\nCaptured at: ${formatTime(currentTime)}\nDuration: ${formatTime(duration)}\n\nURL: ${window.location.href}`,
    category: 'web',
    tags: ['youtube', 'video', 'entertainment', channel.toLowerCase().replace(/\s+/g, '-')],
    type: 'video',
    metadata: {
      source: 'youtube',
      videoTitle: title,
      channel: channel,
      currentTime: currentTime,
      duration: duration,
      url: window.location.href,
      timestamp: Date.now()
    }
  };
  
  saveWebMemory(memory);
  showCaptureNotification(`Video saved! 🎥 (at ${formatTime(currentTime)})`);
}

function captureYouTubeSegment() {
  const video = document.querySelector('video');
  if (!video) return;
  
  const currentTime = Math.floor(video.currentTime);
  const title = document.querySelector('#title h1')?.textContent || 'YouTube Video';
  
  const segmentTitle = prompt(`Save YouTube segment starting at ${formatTime(currentTime)}:\n\nEnter a title for this segment:`);
  if (!segmentTitle) return;
  
  const memory = {
    id: 'youtube_segment_' + Date.now(),
    title: `🎬 ${segmentTitle}`,
    content: `Video segment from: ${title}\n\nStarts at: ${formatTime(currentTime)}\nURL: ${window.location.href}&t=${currentTime}s`,
    category: 'web',
    tags: ['youtube', 'video segment', 'clip', 'bookmark'],
    type: 'video',
    metadata: {
      source: 'youtube_segment',
      segmentTitle: segmentTitle,
      videoTitle: title,
      startTime: currentTime,
      url: `${window.location.href}&t=${currentTime}s`,
      timestamp: Date.now()
    }
  };
  
  saveWebMemory(memory);
  showCaptureNotification(`Segment "${segmentTitle}" saved! 🎬`);
}

// ============================================
// PROMPT CAPTURE
// ============================================

function setupPromptCapture() {
  // Detect common AI chat interfaces
  detectAIChatInterface();
  
  // Add global prompt capture shortcut
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'P') {
      e.preventDefault();
      capturePromptFromPage();
    }
  });
}

function detectAIChatInterface() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('chat.openai.com') || 
      hostname.includes('claude.ai') || 
      hostname.includes('bard.google.com') ||
      hostname.includes('copilot.microsoft.com')) {
    addPromptCaptureButton();
  }
}

function addPromptCaptureButton() {
  // Add floating button for prompt capture
  const button = document.createElement('div');
  button.id = 'promptCaptureBtn';
  button.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 50px;
    height: 50px;
    background: #667eea;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    transition: all 0.2s ease;
  `;
  button.innerHTML = '💬';
  button.title = 'Save Prompt to Memory Agent (Ctrl+Shift+P)';
  
  button.onclick = capturePromptFromPage;
  button.onmouseenter = () => button.style.transform = 'scale(1.1)';
  button.onmouseleave = () => button.style.transform = 'scale(1)';
  
  document.body.appendChild(button);
}

function capturePromptFromPage() {
  // Try to find prompt text in common AI interfaces
  let promptText = '';
  
  // ChatGPT
  const chatGPTInput = document.querySelector('[data-testid="textbox"]') || 
                      document.querySelector('textarea[placeholder*="message"]');
  
  // Claude
  const claudeInput = document.querySelector('.ProseMirror') ||
                     document.querySelector('div[contenteditable="true"]');
  
  // Generic textarea
  const genericInput = document.querySelector('textarea:focus') ||
                      document.querySelector('input[type="text"]:focus');
  
  if (chatGPTInput) {
    promptText = chatGPTInput.value || chatGPTInput.textContent;
  } else if (claudeInput) {
    promptText = claudeInput.textContent || claudeInput.innerText;
  } else if (genericInput) {
    promptText = genericInput.value;
  }
  
  if (!promptText.trim()) {
    // If no input found, let user paste/type
    promptText = prompt('Enter the prompt you want to save:');
  }
  
  if (promptText && promptText.trim().length > 5) {
    savePromptMemory(promptText.trim());
  }
}

function savePromptMemory(promptText) {
  const aiService = detectAIService();
  const timestamp = Date.now();
  
  const memory = {
    id: 'prompt_' + timestamp,
    title: `💬 AI Prompt: ${promptText.substring(0, 50)}...`,
    content: promptText,
    category: 'prompts',
    tags: ['prompt', 'ai', aiService, 'reusable'],
    type: 'text',
    metadata: {
      source: 'prompt_capture',
      aiService: aiService,
      url: window.location.href,
      timestamp: timestamp,
      promptLength: promptText.length
    }
  };
  
  saveWebMemory(memory);
  showCaptureNotification(`Prompt saved for reuse! 💬 (${aiService})`);
}

function detectAIService() {
  const hostname = window.location.hostname;
  
  if (hostname.includes('chat.openai.com')) return 'ChatGPT';
  if (hostname.includes('claude.ai')) return 'Claude';
  if (hostname.includes('bard.google.com')) return 'Bard';
  if (hostname.includes('copilot.microsoft.com')) return 'Copilot';
  if (hostname.includes('perplexity.ai')) return 'Perplexity';
  
  return 'Unknown AI';
}

// ============================================
// PAGE CONTENT CAPTURE
// ============================================

function setupPageCapture() {
  // Add global page capture shortcut
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      capturePageContent();
    }
  });
}

function capturePageContent() {
  const title = document.title;
  const url = window.location.href;
  const content = extractPageContent();
  
  const memory = {
    id: 'page_' + Date.now(),
    title: `🌐 ${title}`,
    content: content,
    category: 'web',
    tags: ['webpage', 'article', 'research', getWebsiteDomain()],
    type: 'text',
    metadata: {
      source: 'page_capture',
      url: url,
      pageTitle: title,
      timestamp: Date.now(),
      contentLength: content.length
    }
  };
  
  saveWebMemory(memory);
  showCaptureNotification('Page content saved! 🌐');
}

function extractPageContent() {
  // Try to get main content from common article selectors
  const contentSelectors = [
    'article',
    '[role="main"]',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    'main'
  ];
  
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      return cleanText(element.textContent || element.innerText);
    }
  }
  
  // Fallback to body content
  const bodyText = document.body.textContent || document.body.innerText;
  return cleanText(bodyText).substring(0, 2000); // Limit to 2000 chars
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function saveWebMemory(memory) {
  // Send to Memory Agent extension
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: 'saveWebMemory',
      memory: memory
    });
  } else {
    // Fallback: save to localStorage for web app
    const webMemories = JSON.parse(localStorage.getItem('webMemories') || '[]');
    webMemories.push(memory);
    localStorage.setItem('webMemories', JSON.stringify(webMemories));
  }
}

function showCaptureNotification(message) {
  // Remove existing notification
  const existing = document.getElementById('captureNotification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'captureNotification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: #28a745;
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10001;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease;
  `;
  
  notification.innerHTML = message;
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideUp 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }
  }, 3000);
}

function getWebsiteDomain() {
  return window.location.hostname.replace('www.', '');
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  }
  
  .web-capture-popup:hover {
    background: #3367d6 !important;
    transform: scale(1.05);
  }
`;
document.head.appendChild(style);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeWebCapture);
} else {
  initializeWebCapture();
}

// Export functions for extension use
if (typeof window !== 'undefined') {
  window.webCapture = {
    captureSelectedText,
    captureYouTubeVideo,
    captureYouTubeSegment,
    capturePromptFromPage,
    capturePageContent,
    saveWebMemory
  };
}
