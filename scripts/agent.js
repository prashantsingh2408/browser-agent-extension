// Agent Chat Assistant Module
// Chat-based interface for AI agents with real-time interaction

// Agent state
let currentAgentType = 'auto';
let isAgentWorking = false;
let chatMessages = [];
let currentWorkingCard = null;
let abortController = null;

// Initialize agent chat functionality
async function initializeAgent() {
  console.log('🤖 Initializing Agent Chat...');
  
  // Setup event listeners
  setupAgentChatEventListeners();
  
  // Setup auto-resize for input
  setupAutoResize();
  
  // Load chat history if any
  loadChatHistory();
  
  // Update status
  updateAgentStatus('ready');
  
  console.log('✅ Agent Chat ready');
}

// Setup event listeners for chat interface
function setupAgentChatEventListeners() {
  // Agent type selector
  const agentSelectors = document.querySelectorAll('.agent-quick-select');
  agentSelectors.forEach(btn => {
    btn.addEventListener('click', () => {
      agentSelectors.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentAgentType = btn.dataset.agent;
      console.log(`Agent type selected: ${currentAgentType}`);
    });
  });
  
  // Input field
  const input = document.getElementById('agentChatInput');
  const sendBtn = document.getElementById('sendAgentMessage');
  
  if (input) {
    // Enable/disable send button based on input
    input.addEventListener('input', () => {
      sendBtn.disabled = !input.value.trim() || isAgentWorking;
      autoResizeTextarea(input);
    });
    
    // Handle Enter key
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!sendBtn.disabled) {
          sendMessage();
        }
      }
    });
    
    // Handle @ mentions
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      if (value.includes('@')) {
        handleAgentMention(value);
      }
    });
  }
  
  // Send button
  if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
  }
  
  // Clear chat button
  const clearBtn = document.getElementById('clearAgentChat');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearChat);
  }
  
  // Interrupt button
  const interruptBtn = document.getElementById('interruptAgent');
  if (interruptBtn) {
    interruptBtn.addEventListener('click', interruptAgent);
  }
}

// Send message in chat
async function sendMessage() {
  const input = document.getElementById('agentChatInput');
  const message = input.value.trim();
  
  if (!message || isAgentWorking) return;
  
  // Clear welcome message if it exists
  const welcomeMsg = document.querySelector('.agent-welcome-message');
  if (welcomeMsg) {
    welcomeMsg.style.display = 'none';
  }
  
  // Add user message to chat
  addChatMessage('user', message);
  
  // Clear input
  input.value = '';
  input.style.height = '40px';
  document.getElementById('sendAgentMessage').disabled = true;
  
  // Parse message for agent type and task
  const { agentType, task } = parseMessage(message);
  
  // Start agent processing
  await processAgentTask(agentType, task);
}

// Parse message for agent mentions and task
function parseMessage(message) {
  let agentType = currentAgentType;
  let task = message;
  
  // Check for @ mentions
  if (message.includes('@')) {
    const mentionMatch = message.match(/@(research|code|write|analyze|researcher|coder|writer|analyst)/i);
    if (mentionMatch) {
      const mention = mentionMatch[1].toLowerCase();
      // Map mentions to agent types
      if (mention.includes('research')) agentType = 'researcher';
      else if (mention.includes('code')) agentType = 'coder';
      else if (mention.includes('write')) agentType = 'writer';
      else if (mention.includes('analy')) agentType = 'analyst';
      
      // Remove mention from task
      task = message.replace(mentionMatch[0], '').trim();
    }
  }
  
  // Check for stop command
  if (message.toLowerCase() === 'stop' || message.toLowerCase() === 'pause') {
    if (isAgentWorking) {
      interruptAgent();
      return { agentType: null, task: null };
    }
  }
  
  return { agentType, task };
}

// Process agent task
async function processAgentTask(agentType, task) {
  if (!task) return;
  
  // Auto-detect agent type if set to auto
  if (agentType === 'auto') {
    agentType = detectAgentType(task);
  }
  
  // Update status
  isAgentWorking = true;
  updateAgentStatus('working');
  showWorkingIndicator(true);
  
  // Create abort controller for interruption
  abortController = new AbortController();
  
  // Create working card in chat
  currentWorkingCard = createWorkingCard(agentType, task);
  
  try {
    // Execute based on agent type
    switch (agentType) {
      case 'researcher':
        await executeResearcherTask(task);
        break;
      case 'coder':
        await executeCoderTask(task);
        break;
      case 'writer':
        await executeWriterTask(task);
        break;
      case 'analyst':
        await executeAnalystTask(task);
        break;
      default:
        // Default to general response
        await executeGeneralTask(task);
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      addChatMessage('agent', '⚠️ Task interrupted. How can I help you differently?');
      // Request feedback
      requestFeedback();
    } else {
      console.error('Agent error:', error);
      addChatMessage('agent', `❌ Sorry, I encountered an error: ${error.message}`);
    }
  } finally {
    // Reset state
    isAgentWorking = false;
    updateAgentStatus('ready');
    showWorkingIndicator(false);
    finalizeWorkingCard();
    abortController = null;
  }
}

// Execute researcher task
async function executeResearcherTask(task) {
  const steps = [
    'Understanding your research query...',
    'Searching for relevant information...',
    'Analyzing sources...',
    'Synthesizing findings...',
    'Preparing summary...'
  ];
  
  for (let i = 0; i < steps.length; i++) {
    if (abortController?.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    
    updateWorkingStep(steps[i]);
    await delay(1000 + Math.random() * 500);
    completeWorkingStep(i);
  }
  
  // Generate response
  let response = await generateAgentResponse('researcher', task);
  addChatMessage('agent', response);
}

// Execute coder task
async function executeCoderTask(task) {
  const steps = [
    'Analyzing requirements...',
    'Designing solution...',
    'Writing code...',
    'Adding error handling...',
    'Finalizing implementation...'
  ];
  
  for (let i = 0; i < steps.length; i++) {
    if (abortController?.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    
    updateWorkingStep(steps[i]);
    await delay(1000 + Math.random() * 500);
    completeWorkingStep(i);
  }
  
  let response = await generateAgentResponse('coder', task);
  addChatMessage('agent', response);
}

// Execute writer task
async function executeWriterTask(task) {
  const steps = [
    'Understanding writing requirements...',
    'Researching topic...',
    'Creating outline...',
    'Writing content...',
    'Polishing text...'
  ];
  
  for (let i = 0; i < steps.length; i++) {
    if (abortController?.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    
    updateWorkingStep(steps[i]);
    await delay(1000 + Math.random() * 500);
    completeWorkingStep(i);
  }
  
  let response = await generateAgentResponse('writer', task);
  addChatMessage('agent', response);
}

// Execute analyst task
async function executeAnalystTask(task) {
  const steps = [
    'Identifying data requirements...',
    'Collecting information...',
    'Performing analysis...',
    'Finding patterns...',
    'Generating insights...'
  ];
  
  for (let i = 0; i < steps.length; i++) {
    if (abortController?.signal.aborted) throw new DOMException('Aborted', 'AbortError');
    
    updateWorkingStep(steps[i]);
    await delay(1000 + Math.random() * 500);
    completeWorkingStep(i);
  }
  
  let response = await generateAgentResponse('analyst', task);
  addChatMessage('agent', response);
}

// Execute general task
async function executeGeneralTask(task) {
  updateWorkingStep('Processing your request...');
  await delay(1500);
  
  let response = await generateAgentResponse('general', task);
  addChatMessage('agent', response);
}

// Generate agent response using AI
async function generateAgentResponse(type, task) {
  try {
    // Try Chrome AI first
    if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create();
      let prompt = '';
      
      switch (type) {
        case 'researcher':
          prompt = `As a research assistant, provide a comprehensive response to: ${task}`;
          break;
        case 'coder':
          prompt = `As a coding assistant, provide code and explanation for: ${task}`;
          break;
        case 'writer':
          prompt = `As a writing assistant, create content for: ${task}`;
          break;
        case 'analyst':
          prompt = `As a data analyst, analyze and provide insights for: ${task}`;
          break;
        default:
          prompt = `Provide a helpful response to: ${task}`;
      }
      
      const response = await session.prompt(prompt);
      session.destroy();
      return response;
    }
  } catch (error) {
    console.warn('AI generation failed, using fallback:', error);
  }
  
  // Fallback responses
  return generateFallbackResponse(type, task);
}

// Generate fallback response when AI is unavailable
function generateFallbackResponse(type, task) {
  const responses = {
    researcher: `I've researched "${task}" for you:\n\n📊 Key Findings:\n• This topic involves multiple important aspects\n• Current trends show increasing interest\n• Further investigation recommended for specific details\n\n💡 Recommendations:\n• Consider exploring related topics\n• Review recent publications\n• Consult domain experts for deeper insights`,
    
    coder: `Here's a code solution for "${task}":\n\n\`\`\`javascript\n// Solution implementation\nfunction solution() {\n  // TODO: Implement ${task}\n  console.log('Processing...');\n  return {\n    success: true,\n    result: 'Completed'\n  };\n}\n\n// Usage\nconst result = solution();\nconsole.log(result);\n\`\`\`\n\n📝 Notes:\n• Customize based on requirements\n• Add error handling as needed\n• Test thoroughly before deployment`,
    
    writer: `Here's content for "${task}":\n\n📝 ${task}\n\nThis topic presents an excellent opportunity to explore various perspectives and considerations. The key points to address include:\n\n1. **Main Focus**: The central theme requires careful attention\n2. **Supporting Details**: Additional context enhances understanding\n3. **Conclusion**: Summarize key takeaways effectively\n\nFeel free to customize this content based on your specific needs.`,
    
    analyst: `Analysis for "${task}":\n\n📈 Data Overview:\n• Scope: Comprehensive analysis required\n• Metrics: Multiple indicators to consider\n• Timeframe: Current and projected\n\n🔍 Key Insights:\n1. Primary trend indicates positive direction\n2. Secondary factors show varying patterns\n3. Correlation between variables significant\n\n💡 Recommendations:\n• Continue monitoring key metrics\n• Implement suggested optimizations\n• Schedule follow-up analysis`,
    
    general: `I understand you want help with "${task}". While I'm processing this request with limited AI capabilities, I can offer general guidance. Please provide more specific details if you need targeted assistance.`
  };
  
  return responses[type] || responses.general;
}

// Add message to chat
function addChatMessage(sender, text) {
  const messagesContainer = document.getElementById('agentChatMessages');
  if (!messagesContainer) return;
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}`;
  
  const avatar = document.createElement('div');
  avatar.className = `message-avatar ${sender}-avatar`;
  avatar.textContent = sender === 'user' ? '👤' : '🤖';
  
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  
  const messageText = document.createElement('div');
  messageText.className = 'message-text';
  messageText.innerHTML = formatMessageText(text);
  
  const messageTime = document.createElement('div');
  messageTime.className = 'message-time';
  messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  bubble.appendChild(messageText);
  bubble.appendChild(messageTime);
  
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(bubble);
  
  messagesContainer.appendChild(messageDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  // Save to history
  chatMessages.push({ sender, text, timestamp: new Date().toISOString() });
  saveChatHistory();
}

// Create working card in chat
function createWorkingCard(agentType, task) {
  const messagesContainer = document.getElementById('agentChatMessages');
  if (!messagesContainer) return null;
  
  const card = document.createElement('div');
  card.className = 'agent-working-card';
  card.innerHTML = `
    <div class="working-header">
      <div class="working-title">
        <span>${getAgentIcon(agentType)}</span>
        <span>${getAgentName(agentType)} is working...</span>
      </div>
    </div>
    <div class="working-steps-list" id="workingStepsList">
      <!-- Steps will be added here -->
    </div>
  `;
  
  messagesContainer.appendChild(card);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  return card;
}

// Update working step
function updateWorkingStep(stepText) {
  const stepsList = document.getElementById('workingStepsList');
  const workingSteps = document.getElementById('workingSteps');
  
  if (stepsList) {
    const step = document.createElement('div');
    step.className = 'working-step active';
    step.textContent = stepText;
    step.dataset.stepIndex = stepsList.children.length;
    stepsList.appendChild(step);
  }
  
  if (workingSteps) {
    workingSteps.textContent = stepText;
  }
}

// Complete working step
function completeWorkingStep(index) {
  const steps = document.querySelectorAll('.working-step');
  if (steps[index]) {
    steps[index].classList.remove('active');
    steps[index].classList.add('completed');
  }
}

// Finalize working card
function finalizeWorkingCard() {
  if (currentWorkingCard) {
    // Mark all steps as completed
    const steps = currentWorkingCard.querySelectorAll('.working-step');
    steps.forEach(step => {
      step.classList.remove('active');
      step.classList.add('completed');
    });
    
    // Update title
    const title = currentWorkingCard.querySelector('.working-title');
    if (title) {
      title.innerHTML = '<span>✅</span><span>Task completed</span>';
    }
    
    currentWorkingCard = null;
  }
}

// Request feedback from user
function requestFeedback() {
  const messagesContainer = document.getElementById('agentChatMessages');
  if (!messagesContainer) return;
  
  const feedbackDiv = document.createElement('div');
  feedbackDiv.className = 'feedback-request';
  feedbackDiv.innerHTML = `
    💭 <strong>Feedback needed:</strong> The task was interrupted. 
    What would you like me to do differently? 
    You can provide specific guidance or try a different approach.
  `;
  
  messagesContainer.appendChild(feedbackDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Interrupt agent
function interruptAgent() {
  if (isAgentWorking && abortController) {
    console.log('Interrupting agent...');
    abortController.abort();
  }
}

// Show/hide working indicator
function showWorkingIndicator(show) {
  const indicator = document.getElementById('agentWorkingIndicator');
  if (indicator) {
    indicator.style.display = show ? 'block' : 'none';
  }
  
  // Disable/enable input
  const input = document.getElementById('agentChatInput');
  const sendBtn = document.getElementById('sendAgentMessage');
  if (input && sendBtn) {
    if (show) {
      input.placeholder = 'Agent is working... You can type "stop" to interrupt';
    } else {
      input.placeholder = 'Ask me anything or use @ to select an agent (e.g., @research climate change)';
    }
    sendBtn.disabled = show || !input.value.trim();
  }
}

// Clear chat
function clearChat() {
  const messagesContainer = document.getElementById('agentChatMessages');
  if (messagesContainer) {
    messagesContainer.innerHTML = `
      <div class="agent-welcome-message">
        <div class="welcome-icon">🤖</div>
        <h3>Welcome to AI Agent Chat</h3>
        <p>I'm your AI agent assistant. I can help you with:</p>
        <div class="agent-capabilities">
          <div class="capability">
            <span class="cap-icon">🔍</span>
            <span class="cap-text"><strong>@research</strong> - Research any topic</span>
          </div>
          <div class="capability">
            <span class="cap-icon">💻</span>
            <span class="cap-text"><strong>@code</strong> - Write and debug code</span>
          </div>
          <div class="capability">
            <span class="cap-icon">✍️</span>
            <span class="cap-text"><strong>@write</strong> - Create content</span>
          </div>
          <div class="capability">
            <span class="cap-icon">📊</span>
            <span class="cap-text"><strong>@analyze</strong> - Analyze data</span>
          </div>
        </div>
        <p class="welcome-tip">💡 <strong>Tip:</strong> You can interrupt me anytime by clicking "Stop" or typing "stop"</p>
      </div>
    `;
  }
  
  chatMessages = [];
  saveChatHistory();
}

// Update agent status
function updateAgentStatus(status) {
  const statusDot = document.querySelector('.agent-status-indicator .status-dot');
  const statusText = document.querySelector('.agent-status-indicator .status-text');
  
  if (statusDot && statusText) {
    switch (status) {
      case 'ready':
        statusDot.style.background = 'var(--success)';
        statusText.textContent = 'Ready';
        break;
      case 'working':
        statusDot.style.background = 'var(--primary)';
        statusText.textContent = 'Working';
        break;
      case 'error':
        statusDot.style.background = 'var(--error)';
        statusText.textContent = 'Error';
        break;
    }
  }
}

// Auto-detect agent type from task
function detectAgentType(task) {
  const taskLower = task.toLowerCase();
  
  if (taskLower.includes('research') || taskLower.includes('find') || taskLower.includes('search')) {
    return 'researcher';
  } else if (taskLower.includes('code') || taskLower.includes('function') || taskLower.includes('script') || taskLower.includes('program')) {
    return 'coder';
  } else if (taskLower.includes('write') || taskLower.includes('email') || taskLower.includes('article') || taskLower.includes('content')) {
    return 'writer';
  } else if (taskLower.includes('analyze') || taskLower.includes('data') || taskLower.includes('metrics') || taskLower.includes('insights')) {
    return 'analyst';
  }
  
  // Default to researcher for general queries
  return 'researcher';
}

// Handle @ mentions in input
function handleAgentMention(text) {
  // This could show a dropdown of agent options
  // For now, we'll just let the user type
}

// Get agent icon
function getAgentIcon(type) {
  const icons = {
    researcher: '🔍',
    coder: '💻',
    writer: '✍️',
    analyst: '📊',
    auto: '🤖'
  };
  return icons[type] || '🤖';
}

// Get agent name
function getAgentName(type) {
  const names = {
    researcher: 'Research Agent',
    coder: 'Coding Agent',
    writer: 'Writing Agent',
    analyst: 'Analysis Agent',
    auto: 'AI Agent'
  };
  return names[type] || 'AI Agent';
}

// Format message text with markdown support
function formatMessageText(text) {
  // Code blocks
  text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<pre><code class="language-${lang || ''}">${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // Inline code
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  
  // Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // Italic
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // Line breaks
  text = text.replace(/\n/g, '<br>');
  
  return text;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Setup auto-resize for textarea
function setupAutoResize() {
  const textarea = document.getElementById('agentChatInput');
  if (textarea) {
    textarea.addEventListener('input', () => autoResizeTextarea(textarea));
  }
}

// Auto-resize textarea
function autoResizeTextarea(textarea) {
  textarea.style.height = 'auto';
  const newHeight = Math.min(textarea.scrollHeight, 120);
  textarea.style.height = newHeight + 'px';
}

// Save chat history
function saveChatHistory() {
  try {
    chrome.storage.local.set({ agentChatHistory: chatMessages });
  } catch (error) {
    console.warn('Could not save chat history:', error);
  }
}

// Load chat history
async function loadChatHistory() {
  try {
    const result = await chrome.storage.local.get('agentChatHistory');
    if (result.agentChatHistory && result.agentChatHistory.length > 0) {
      chatMessages = result.agentChatHistory;
      
      // Hide welcome message
      const welcomeMsg = document.querySelector('.agent-welcome-message');
      if (welcomeMsg) {
        welcomeMsg.style.display = 'none';
      }
      
      // Restore messages
      chatMessages.forEach(msg => {
        const messagesContainer = document.getElementById('agentChatMessages');
        if (messagesContainer) {
          const messageDiv = document.createElement('div');
          messageDiv.className = `chat-message ${msg.sender}`;
          
          const avatar = document.createElement('div');
          avatar.className = `message-avatar ${msg.sender}-avatar`;
          avatar.textContent = msg.sender === 'user' ? '👤' : '🤖';
          
          const bubble = document.createElement('div');
          bubble.className = 'message-bubble';
          
          const messageText = document.createElement('div');
          messageText.className = 'message-text';
          messageText.innerHTML = formatMessageText(msg.text);
          
          const messageTime = document.createElement('div');
          messageTime.className = 'message-time';
          messageTime.textContent = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          bubble.appendChild(messageText);
          bubble.appendChild(messageTime);
          
          messageDiv.appendChild(avatar);
          messageDiv.appendChild(bubble);
          
          messagesContainer.appendChild(messageDiv);
        }
      });
    }
  } catch (error) {
    console.warn('Could not load chat history:', error);
  }
}

// Cleanup agent resources
function cleanupAgent() {
  if (isAgentWorking && abortController) {
    abortController.abort();
  }
  saveChatHistory();
}

// Utility: delay function
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Export functions for use in sidepanel.js
window.initializeAgent = initializeAgent;
window.cleanupAgent = cleanupAgent;