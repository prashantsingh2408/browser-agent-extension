// Learning Memory System - Inspired by Orma
// Transforms browsing into learning with AI-powered memory

console.log('🎓 Learning Memory System loading...');

// Learning memory categories
const LEARNING_CATEGORIES = {
  research: { name: 'Research', color: '#4285f4', icon: '🔍' },
  tutorial: { name: 'Tutorial', color: '#34a853', icon: '📚' },
  reference: { name: 'Reference', color: '#fbbc04', icon: '📖' },
  inspiration: { name: 'Inspiration', color: '#ea4335', icon: '💡' },
  project: { name: 'Project', color: '#9c27b0', icon: '🚀' }
};

// Learning memory types
const LEARNING_TYPES = {
  article: { name: 'Article', icon: '📄', pattern: /article|blog|post/ },
  video: { name: 'Video', icon: '🎥', pattern: /youtube|vimeo|video/ },
  code: { name: 'Code', icon: '💻', pattern: /github|stackoverflow|codepen/ },
  documentation: { name: 'Docs', icon: '📋', pattern: /docs|documentation|api/ },
  course: { name: 'Course', icon: '🎓', pattern: /course|learn|tutorial/ }
};

// Initialize Learning Memory System
function initializeLearningMemory() {
  console.log('🎓 Initializing Learning Memory System...');
  
  // Setup automatic content detection
  setupContentDetection();
  
  // Setup learning workspace
  setupLearningWorkspace();
  
  // Setup AI chat integration
  setupAIChatIntegration();
  
  // Setup learning analytics
  setupLearningAnalytics();
}

// ============================================
// AUTOMATIC CONTENT DETECTION
// ============================================

function setupContentDetection() {
  // Detect when user is on learning-relevant pages
  const url = window.location.href;
  const title = document.title;
  
  // Check if this looks like learning content
  if (isLearningContent(url, title)) {
    showLearningCapturePrompt();
  }
  
  // Monitor for text selection (like Orma)
  document.addEventListener('mouseup', handleLearningSelection);
  
  // Monitor for video timestamps (YouTube, etc.)
  if (url.includes('youtube.com')) {
    setupYouTubeLearningCapture();
  }
  
  // Monitor for code snippets
  setupCodeSnippetCapture();
}

function isLearningContent(url, title) {
  const learningIndicators = [
    'tutorial', 'learn', 'course', 'documentation', 'guide', 'how-to',
    'stackoverflow', 'github', 'medium', 'dev.to', 'youtube', 'coursera',
    'udemy', 'khan', 'freecodecamp', 'mdn', 'w3schools'
  ];
  
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  
  return learningIndicators.some(indicator => 
    urlLower.includes(indicator) || titleLower.includes(indicator)
  );
}

function showLearningCapturePrompt() {
  // Show a subtle prompt to capture this learning content
  const prompt = document.createElement('div');
  prompt.id = 'learningCapturePrompt';
  prompt.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 16px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    animation: slideInRight 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
  `;
  
  prompt.innerHTML = `
    <span>🎓</span>
    <span>Save to Learning Memory</span>
    <span style="opacity: 0.7; font-size: 12px;">Ctrl+Shift+L</span>
  `;
  
  prompt.onclick = () => captureLearningContent();
  
  document.body.appendChild(prompt);
  
  // Auto-hide after 8 seconds
  setTimeout(() => {
    if (prompt.parentNode) {
      prompt.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => prompt.remove(), 300);
    }
  }, 8000);
  
  // Add keyboard shortcut
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'L') {
      e.preventDefault();
      captureLearningContent();
      prompt.remove();
    }
  });
}

function handleLearningSelection() {
  const selection = window.getSelection();
  const selectedText = selection.toString().trim();
  
  if (selectedText.length > 20) { // Meaningful learning content
    showLearningSelectionPopup(selectedText, selection);
  }
}

function showLearningSelectionPopup(text, selection) {
  // Remove existing popup
  const existing = document.getElementById('learningSelectionPopup');
  if (existing) existing.remove();
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  const popup = document.createElement('div');
  popup.id = 'learningSelectionPopup';
  popup.style.cssText = `
    position: fixed;
    top: ${rect.bottom + window.scrollY + 10}px;
    left: ${rect.left + window.scrollX}px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 10px 15px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    z-index: 10000;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
    display: flex;
    align-items: center;
    gap: 8px;
    animation: popIn 0.2s ease;
  `;
  
  popup.innerHTML = `
    <span>🎓</span>
    <span>Save Learning Note</span>
  `;
  
  popup.onclick = () => {
    captureLearningSelection(text);
    popup.remove();
  };
  
  document.body.appendChild(popup);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (popup.parentNode) popup.remove();
  }, 5000);
}

// ============================================
// LEARNING CONTENT CAPTURE
// ============================================

function captureLearningContent() {
  const url = window.location.href;
  const title = document.title;
  const content = extractLearningContent();
  const contentType = detectContentType(url, title);
  const category = suggestLearningCategory(url, title, content);
  
  const learningMemory = {
    id: 'learning_' + Date.now(),
    title: `🎓 ${title}`,
    content: content,
    category: 'learning',
    tags: ['learning', contentType.name.toLowerCase(), category, getDomainTag(url)],
    type: 'learning',
    learningData: {
      contentType: contentType.name,
      category: category,
      url: url,
      domain: getDomainTag(url),
      timestamp: Date.now(),
      readingTime: estimateReadingTime(content),
      difficulty: assessDifficulty(content),
      topics: extractTopics(content)
    },
    metadata: {
      source: 'learning_capture',
      url: url,
      pageTitle: title,
      timestamp: Date.now()
    }
  };
  
  saveLearningMemory(learningMemory);
  showLearningNotification(`Learning content saved! 🎓 (${contentType.name})`);
}

function captureLearningSelection(text) {
  const url = window.location.href;
  const title = document.title;
  const contentType = detectContentType(url, title);
  
  const learningMemory = {
    id: 'learning_note_' + Date.now(),
    title: `📝 Note: ${text.substring(0, 50)}...`,
    content: text,
    category: 'learning',
    tags: ['learning note', 'selection', contentType.name.toLowerCase(), getDomainTag(url)],
    type: 'learning_note',
    learningData: {
      contentType: 'Note',
      category: 'research',
      url: url,
      domain: getDomainTag(url),
      timestamp: Date.now(),
      readingTime: estimateReadingTime(text),
      topics: extractTopics(text),
      isSelection: true,
      selectionLength: text.length
    },
    metadata: {
      source: 'learning_selection',
      url: url,
      pageTitle: title,
      timestamp: Date.now()
    }
  };
  
  saveLearningMemory(learningMemory);
  showLearningNotification('Learning note saved! 📝');
}

// ============================================
// YOUTUBE LEARNING CAPTURE
// ============================================

function setupYouTubeLearningCapture() {
  // Add learning capture button to YouTube
  setTimeout(() => {
    const controls = document.querySelector('.ytp-chrome-controls');
    if (controls && !document.getElementById('learningYTBtn')) {
      const button = document.createElement('button');
      button.id = 'learningYTBtn';
      button.className = 'ytp-button';
      button.title = 'Save Learning Moment (Ctrl+Shift+Y)';
      button.innerHTML = '🎓';
      button.style.cssText = `
        font-size: 16px;
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0 8px;
      `;
      
      button.onclick = captureYouTubeLearningMoment;
      controls.appendChild(button);
    }
  }, 2000);
  
  // Keyboard shortcut for YouTube learning capture
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'Y') {
      e.preventDefault();
      captureYouTubeLearningMoment();
    }
  });
}

function captureYouTubeLearningMoment() {
  const video = document.querySelector('video');
  const title = document.querySelector('#title h1')?.textContent || 'YouTube Video';
  const channel = document.querySelector('#channel-name a')?.textContent || 'Unknown Channel';
  const currentTime = video ? Math.floor(video.currentTime) : 0;
  
  // Prompt for learning note
  const note = prompt(`Learning moment at ${formatTime(currentTime)}:\n\nWhat did you learn? (optional)`);
  
  const learningMemory = {
    id: 'youtube_learning_' + Date.now(),
    title: `🎥 ${title} - Learning Moment`,
    content: `${note || 'Key learning moment'}\n\nVideo: ${title}\nChannel: ${channel}\nTimestamp: ${formatTime(currentTime)}\n\nURL: ${window.location.href}&t=${currentTime}s`,
    category: 'learning',
    tags: ['youtube', 'video learning', 'tutorial', channel.toLowerCase().replace(/\s+/g, '-')],
    type: 'video_learning',
    learningData: {
      contentType: 'Video',
      category: 'tutorial',
      url: `${window.location.href}&t=${currentTime}s`,
      domain: 'youtube.com',
      timestamp: Date.now(),
      videoTitle: title,
      channel: channel,
      currentTime: currentTime,
      learningNote: note,
      topics: extractTopics(title + ' ' + (note || ''))
    },
    metadata: {
      source: 'youtube_learning',
      videoTitle: title,
      channel: channel,
      currentTime: currentTime,
      url: window.location.href,
      timestamp: Date.now()
    }
  };
  
  saveLearningMemory(learningMemory);
  showLearningNotification(`Learning moment saved! 🎥 (${formatTime(currentTime)})`);
}

// ============================================
// CODE SNIPPET CAPTURE
// ============================================

function setupCodeSnippetCapture() {
  // Detect code blocks and add capture buttons
  const codeBlocks = document.querySelectorAll('pre, code, .highlight, .code-block');
  
  codeBlocks.forEach((block, index) => {
    if (block.textContent.length > 50) { // Meaningful code
      addCodeCaptureButton(block, index);
    }
  });
}

function addCodeCaptureButton(codeBlock, index) {
  const button = document.createElement('button');
  button.className = 'code-capture-btn';
  button.innerHTML = '💾 Save Code';
  button.style.cssText = `
    position: absolute;
    top: 5px;
    right: 5px;
    background: #667eea;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    cursor: pointer;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.2s ease;
  `;
  
  // Make parent relative for positioning
  if (getComputedStyle(codeBlock).position === 'static') {
    codeBlock.style.position = 'relative';
  }
  
  button.onclick = () => captureCodeSnippet(codeBlock, index);
  codeBlock.appendChild(button);
  
  // Show button on hover
  codeBlock.addEventListener('mouseenter', () => {
    button.style.opacity = '1';
  });
  
  codeBlock.addEventListener('mouseleave', () => {
    button.style.opacity = '0';
  });
}

function captureCodeSnippet(codeBlock, index) {
  const code = codeBlock.textContent;
  const language = detectCodeLanguage(codeBlock);
  const context = getCodeContext(codeBlock);
  
  const learningMemory = {
    id: 'code_snippet_' + Date.now(),
    title: `💻 Code Snippet: ${language}`,
    content: `${context}\n\n\`\`\`${language}\n${code}\n\`\`\``,
    category: 'learning',
    tags: ['code', language.toLowerCase(), 'programming', getDomainTag(window.location.href)],
    type: 'code_snippet',
    learningData: {
      contentType: 'Code',
      category: 'reference',
      language: language,
      url: window.location.href,
      domain: getDomainTag(window.location.href),
      timestamp: Date.now(),
      codeLength: code.length,
      topics: [language, 'programming']
    },
    metadata: {
      source: 'code_capture',
      language: language,
      url: window.location.href,
      timestamp: Date.now()
    }
  };
  
  saveLearningMemory(learningMemory);
  showLearningNotification(`Code snippet saved! 💻 (${language})`);
}

// ============================================
// AI CHAT INTEGRATION (Like Orma)
// ============================================

function setupAIChatIntegration() {
  // Add "Use in AI Chat" buttons to learning memories
  // This will be integrated with the existing memory chat system
  console.log('🤖 AI Chat integration ready for learning memories');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function extractLearningContent() {
  // Extract main learning content from page
  const contentSelectors = [
    'article',
    '[role="main"]',
    '.content',
    '.post-content',
    '.entry-content',
    '.article-content',
    '.tutorial-content',
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
  return cleanText(bodyText).substring(0, 3000); // Limit for learning content
}

function detectContentType(url, title) {
  for (const [key, type] of Object.entries(LEARNING_TYPES)) {
    if (type.pattern.test(url.toLowerCase()) || type.pattern.test(title.toLowerCase())) {
      return type;
    }
  }
  return { name: 'Article', icon: '📄' };
}

function suggestLearningCategory(url, title, content) {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  const contentLower = content.toLowerCase();
  
  if (urlLower.includes('tutorial') || titleLower.includes('tutorial') || titleLower.includes('how to')) {
    return 'tutorial';
  }
  if (urlLower.includes('docs') || urlLower.includes('documentation') || titleLower.includes('reference')) {
    return 'reference';
  }
  if (urlLower.includes('course') || titleLower.includes('course') || titleLower.includes('learn')) {
    return 'tutorial';
  }
  if (contentLower.includes('research') || titleLower.includes('study')) {
    return 'research';
  }
  
  return 'research'; // Default
}

function getDomainTag(url) {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return 'unknown';
  }
}

function estimateReadingTime(text) {
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

function assessDifficulty(content) {
  // Simple difficulty assessment based on content characteristics
  const technicalTerms = ['algorithm', 'implementation', 'architecture', 'framework', 'API', 'database'];
  const complexWords = content.split(/\s+/).filter(word => word.length > 8).length;
  const technicalCount = technicalTerms.filter(term => content.toLowerCase().includes(term)).length;
  
  if (technicalCount > 3 || complexWords > content.split(/\s+/).length * 0.3) {
    return 'advanced';
  } else if (technicalCount > 1 || complexWords > content.split(/\s+/).length * 0.2) {
    return 'intermediate';
  }
  return 'beginner';
}

function extractTopics(text) {
  // Simple topic extraction (could be enhanced with NLP)
  const commonTopics = [
    'javascript', 'python', 'react', 'node', 'css', 'html', 'api', 'database',
    'machine learning', 'ai', 'web development', 'mobile', 'design', 'ux', 'ui'
  ];
  
  const textLower = text.toLowerCase();
  return commonTopics.filter(topic => textLower.includes(topic));
}

function detectCodeLanguage(codeBlock) {
  const className = codeBlock.className;
  const languages = ['javascript', 'python', 'java', 'cpp', 'css', 'html', 'sql', 'bash', 'json'];
  
  for (const lang of languages) {
    if (className.includes(lang) || className.includes(`language-${lang}`)) {
      return lang;
    }
  }
  
  // Simple heuristic detection
  const code = codeBlock.textContent;
  if (code.includes('function') && code.includes('{')) return 'javascript';
  if (code.includes('def ') && code.includes(':')) return 'python';
  if (code.includes('public class')) return 'java';
  if (code.includes('SELECT') && code.includes('FROM')) return 'sql';
  
  return 'code';
}

function getCodeContext(codeBlock) {
  // Get surrounding context for the code
  const parent = codeBlock.parentElement;
  const prevSibling = codeBlock.previousElementSibling;
  
  let context = '';
  
  if (prevSibling && prevSibling.textContent.length < 200) {
    context = prevSibling.textContent.trim();
  }
  
  if (!context && parent) {
    const headings = parent.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length > 0) {
      context = headings[headings.length - 1].textContent.trim();
    }
  }
  
  return context || 'Code snippet';
}

function saveLearningMemory(memory) {
  // Save to Memory Agent system
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({
      action: 'saveWebMemory',
      memory: memory
    });
  } else {
    // Fallback for web app
    const learningMemories = JSON.parse(localStorage.getItem('learningMemories') || '[]');
    learningMemories.push(memory);
    localStorage.setItem('learningMemories', JSON.stringify(learningMemories));
  }
}

function showLearningNotification(message) {
  // Remove existing notification
  const existing = document.getElementById('learningNotification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.id = 'learningNotification';
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 14px;
    font-weight: 500;
    z-index: 10001;
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
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

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
}

// Add CSS animations
const learningStyle = document.createElement('style');
learningStyle.textContent = `
  @keyframes slideInRight {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOutRight {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes popIn {
    from { transform: scale(0.8); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
  
  @keyframes slideDown {
    from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
    to { transform: translateX(-50%) translateY(0); opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateX(-50%) translateY(0); opacity: 1; }
    to { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  }
`;
document.head.appendChild(learningStyle);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLearningMemory);
} else {
  initializeLearningMemory();
}

// Export for extension use
if (typeof window !== 'undefined') {
  window.learningMemory = {
    captureLearningContent,
    captureLearningSelection,
    captureYouTubeLearningMoment,
    captureCodeSnippet,
    saveLearningMemory
  };
}

console.log('🎓 Learning Memory System loaded!');
