// Settings Module
// Manages LLM provider configuration and task-specific model selection

// Default settings
const defaultSettings = {
  primaryProvider: 'chrome-ai',
  apiKey: '',
  apiEndpoint: '',
  taskModels: {
    chat: 'default',
    email: 'default',
    research: 'default',
    code: 'default',
    writing: 'default',
    analysis: 'default'
  },
  advanced: {
    enableFallback: true,
    saveHistory: true,
    showApiStatus: true,
    temperature: 0.7,
    maxTokens: 2048
  }
};

// Current settings
let currentSettings = { ...defaultSettings };

// Initialize settings
async function initializeSettings() {
  console.log('⚙️ Initializing Settings...');
  
  // Load saved settings
  await loadSettings();
  
  // Setup event listeners
  setupSettingsEventListeners();
  
  // Apply initial UI state
  applySettingsToUI();
  
  console.log('✅ Settings initialized');
}

// Setup event listeners
function setupSettingsEventListeners() {
  // Primary provider change
  const providerSelect = document.getElementById('primaryLLMProvider');
  if (providerSelect) {
    providerSelect.addEventListener('change', (e) => {
      handleProviderChange(e.target.value);
    });
  }
  
  // Save button
  const saveBtn = document.getElementById('saveSettingsBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveSettings);
  }
  
  // Temperature slider
  const tempSlider = document.getElementById('temperature');
  const tempValue = document.getElementById('temperatureValue');
  if (tempSlider && tempValue) {
    tempSlider.addEventListener('input', (e) => {
      const value = e.target.value / 100;
      tempValue.textContent = value.toFixed(2);
    });
  }
  
  // Reset settings
  const resetLink = document.getElementById('resetSettings');
  if (resetLink) {
    resetLink.addEventListener('click', (e) => {
      e.preventDefault();
      if (confirm('Reset all settings to defaults?')) {
        resetSettings();
      }
    });
  }
  
  // Export settings
  const exportLink = document.getElementById('exportSettings');
  if (exportLink) {
    exportLink.addEventListener('click', (e) => {
      e.preventDefault();
      exportSettings();
    });
  }
  
  // Import settings
  const importLink = document.getElementById('importSettings');
  if (importLink) {
    importLink.addEventListener('click', (e) => {
      e.preventDefault();
      importSettings();
    });
  }
  
  // AI Test buttons
  const quickTestBtn = document.getElementById('quickAITest');
  if (quickTestBtn) {
    quickTestBtn.addEventListener('click', runQuickAITest);
  }
  
  const fullTestBtn = document.getElementById('fullAITest');
  if (fullTestBtn) {
    fullTestBtn.addEventListener('click', runFullAITest);
  }
  
  const checkAPIsBtn = document.getElementById('checkAPIsBtn');
  if (checkAPIsBtn) {
    checkAPIsBtn.addEventListener('click', runCheckAPIs);
  }
}

// Handle provider change
function handleProviderChange(provider) {
  const apiKeySection = document.getElementById('apiKeySection');
  const customApiSection = document.getElementById('customApiSection');
  
  // Show/hide API key section based on provider
  if (provider === 'openai' || provider === 'anthropic' || provider === 'google') {
    apiKeySection.style.display = 'block';
    customApiSection.style.display = 'none';
  } else if (provider === 'custom') {
    apiKeySection.style.display = 'block';
    customApiSection.style.display = 'block';
  } else {
    apiKeySection.style.display = 'none';
    customApiSection.style.display = 'none';
  }
  
  // Update current settings
  currentSettings.primaryProvider = provider;
}

// Save settings
async function saveSettings() {
  console.log('💾 Saving settings...');
  
  // Gather settings from UI
  currentSettings = {
    primaryProvider: document.getElementById('primaryLLMProvider')?.value || 'chrome-ai',
    apiKey: document.getElementById('apiKey')?.value || '',
    apiEndpoint: document.getElementById('apiEndpoint')?.value || '',
    taskModels: {
      chat: document.getElementById('chatLLM')?.value || 'default',
      email: document.getElementById('emailLLM')?.value || 'default',
      research: document.getElementById('researchLLM')?.value || 'default',
      code: document.getElementById('codeLLM')?.value || 'default',
      writing: document.getElementById('writingLLM')?.value || 'default',
      analysis: document.getElementById('analysisLLM')?.value || 'default'
    },
    advanced: {
      enableFallback: document.getElementById('enableFallback')?.checked ?? true,
      saveHistory: document.getElementById('saveHistory')?.checked ?? true,
      showApiStatus: document.getElementById('showApiStatus')?.checked ?? true,
      temperature: (document.getElementById('temperature')?.value || 70) / 100,
      maxTokens: parseInt(document.getElementById('maxTokens')?.value || 2048)
    }
  };
  
  // Save to storage
  try {
    await chrome.storage.local.set({ llmSettings: currentSettings });
    showSettingsNotification('Settings saved successfully!', 'success');
    
    // Notify other modules about settings change
    window.dispatchEvent(new CustomEvent('settingsChanged', { detail: currentSettings }));
  } catch (error) {
    console.error('Failed to save settings:', error);
    showSettingsNotification('Failed to save settings', 'error');
  }
}

// Load settings
async function loadSettings() {
  try {
    const result = await chrome.storage.local.get('llmSettings');
    if (result.llmSettings) {
      currentSettings = { ...defaultSettings, ...result.llmSettings };
      console.log('Settings loaded:', currentSettings);
    }
  } catch (error) {
    console.warn('Could not load settings:', error);
  }
}

// Apply settings to UI
function applySettingsToUI() {
  // Primary provider
  const providerSelect = document.getElementById('primaryLLMProvider');
  if (providerSelect) {
    providerSelect.value = currentSettings.primaryProvider;
    handleProviderChange(currentSettings.primaryProvider);
  }
  
  // API credentials
  const apiKeyInput = document.getElementById('apiKey');
  if (apiKeyInput && currentSettings.apiKey) {
    apiKeyInput.value = currentSettings.apiKey;
  }
  
  const apiEndpointInput = document.getElementById('apiEndpoint');
  if (apiEndpointInput && currentSettings.apiEndpoint) {
    apiEndpointInput.value = currentSettings.apiEndpoint;
  }
  
  // Task models
  Object.keys(currentSettings.taskModels).forEach(task => {
    const select = document.getElementById(`${task}LLM`);
    if (select) {
      select.value = currentSettings.taskModels[task];
    }
  });
  
  // Advanced settings
  const enableFallback = document.getElementById('enableFallback');
  if (enableFallback) {
    enableFallback.checked = currentSettings.advanced.enableFallback;
  }
  
  const saveHistory = document.getElementById('saveHistory');
  if (saveHistory) {
    saveHistory.checked = currentSettings.advanced.saveHistory;
  }
  
  const showApiStatus = document.getElementById('showApiStatus');
  if (showApiStatus) {
    showApiStatus.checked = currentSettings.advanced.showApiStatus;
  }
  
  const tempSlider = document.getElementById('temperature');
  const tempValue = document.getElementById('temperatureValue');
  if (tempSlider && tempValue) {
    tempSlider.value = currentSettings.advanced.temperature * 100;
    tempValue.textContent = currentSettings.advanced.temperature.toFixed(2);
  }
  
  const maxTokens = document.getElementById('maxTokens');
  if (maxTokens) {
    maxTokens.value = currentSettings.advanced.maxTokens;
  }
}

// Reset settings
function resetSettings() {
  currentSettings = { ...defaultSettings };
  applySettingsToUI();
  saveSettings();
  showSettingsNotification('Settings reset to defaults', 'info');
}

// Export settings
function exportSettings() {
  const dataStr = JSON.stringify(currentSettings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'ai-extension-settings.json';
  link.click();
  
  URL.revokeObjectURL(url);
  showSettingsNotification('Settings exported successfully', 'success');
}

// Import settings
function importSettings() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      
      // Validate imported settings
      if (imported.primaryProvider && imported.taskModels) {
        currentSettings = { ...defaultSettings, ...imported };
        applySettingsToUI();
        await saveSettings();
        showSettingsNotification('Settings imported successfully', 'success');
      } else {
        throw new Error('Invalid settings file format');
      }
    } catch (error) {
      console.error('Failed to import settings:', error);
      showSettingsNotification('Failed to import settings: Invalid file', 'error');
    }
  };
  
  input.click();
}

// Show notification
function showSettingsNotification(message, type = 'info') {
  // Find or create notification container
  let notifContainer = document.querySelector('.settings-notification');
  if (!notifContainer) {
    notifContainer = document.createElement('div');
    notifContainer.className = 'settings-notification';
    document.querySelector('.settings-container')?.appendChild(notifContainer);
  }
  
  // Set notification style based on type
  const typeStyles = {
    success: 'background: #4caf50; color: white;',
    error: 'background: #f44336; color: white;',
    info: 'background: #2196f3; color: white;'
  };
  
  notifContainer.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 6px;
    font-size: 14px;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    ${typeStyles[type] || typeStyles.info}
  `;
  
  notifContainer.textContent = message;
  notifContainer.style.display = 'block';
  
  // Auto-hide after 3 seconds
  setTimeout(() => {
    notifContainer.style.display = 'none';
  }, 3000);
}

// Get current LLM settings
function getCurrentLLMSettings() {
  return currentSettings;
}

// Get LLM for specific task
function getLLMForTask(task) {
  const taskModel = currentSettings.taskModels[task];
  if (taskModel === 'default') {
    return currentSettings.primaryProvider;
  }
  return taskModel;
}

// Check if API key is configured
function isAPIKeyConfigured() {
  const provider = currentSettings.primaryProvider;
  if (provider === 'chrome-ai' || provider === 'local') {
    return true; // No API key needed
  }
  return !!currentSettings.apiKey;
}

// Initialize when Settings tab is opened
window.initializeSettings = initializeSettings;

// Export functions for use by other modules
window.getLLMSettings = getCurrentLLMSettings;
window.getLLMForTask = getLLMForTask;
window.isAPIKeyConfigured = isAPIKeyConfigured;

// Listen for settings tab activation
window.addEventListener('settingsTabActivated', () => {
  initializeSettings();
  // Check Chrome AI status when settings tab opens
  checkChromeAIStatus();
});

// ============================================
// AI TESTING FUNCTIONS
// ============================================

// Quick AI Test
async function runQuickAITest() {
  const btn = document.getElementById('quickAITest');
  const resultsDiv = document.getElementById('aiTestResults');
  const outputDiv = document.getElementById('testOutput');
  const statusDiv = document.getElementById('testStatus');
  
  // Disable button and show results
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Testing...';
  resultsDiv.style.display = 'block';
  outputDiv.innerHTML = '';
  
  updateTestStatus('info', '🚀 Running quick test...');
  
  try {
    // Capture console output
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      logs.push(args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };
    
    // Run quick test
    const results = await window.chromeAI.quickTestAIAPIs();
    
    // Restore console.log
    console.log = originalLog;
    
    // Display results
    outputDiv.innerHTML = `<pre>${logs.join('\n')}</pre>`;
    
    if (results['✅ Recommended']) {
      updateTestStatus('success', `✅ Chrome AI is ready! Using ${results['✅ Recommended']}`);
      updateChromeAIStatus('success', `✅ Chrome AI Active: ${results['✅ Recommended']}`);
    } else {
      updateTestStatus('warning', '⚠️ Chrome AI not detected. Enable in chrome://flags');
      updateChromeAIStatus('warning', '⚠️ Chrome AI Not Available');
    }
    
  } catch (error) {
    updateTestStatus('error', `❌ Test failed: ${error.message}`);
    outputDiv.innerHTML = `<pre style="color: #f44336;">Error: ${error.message}\n\nTo enable Chrome AI:\n1. Go to chrome://flags\n2. Search for "Optimization Guide On Device Model"\n3. Set to "Enabled BypassPerfRequirement"\n4. Restart Chrome</pre>`;
    updateChromeAIStatus('error', '❌ Chrome AI Error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> Quick Test (2s)';
  }
}

// Full AI Test
async function runFullAITest() {
  const btn = document.getElementById('fullAITest');
  const resultsDiv = document.getElementById('aiTestResults');
  const outputDiv = document.getElementById('testOutput');
  
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Testing...';
  resultsDiv.style.display = 'block';
  outputDiv.innerHTML = '';
  
  updateTestStatus('info', '🧪 Running comprehensive test (may take 30 seconds)...');
  
  try {
    // Capture console output
    const logs = [];
    const originalLog = console.log;
    console.log = (...args) => {
      originalLog(...args);
      const logText = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(logText);
      
      // Update output in real-time
      outputDiv.innerHTML = `<pre>${logs.join('\n')}</pre>`;
      outputDiv.scrollTop = outputDiv.scrollHeight;
    };
    
    // Run full test
    const results = await window.chromeAI.testAllAIAPIs();
    
    // Restore console.log
    console.log = originalLog;
    
    // Update status based on results
    if (results.summary.failed === 0 && results.summary.passed > 0) {
      updateTestStatus('success', `✅ All tests passed! (${results.summary.passed} passed, ${results.summary.skipped} skipped)`);
      updateChromeAIStatus('success', '✅ Chrome AI Working Perfectly');
    } else if (results.summary.passed > 0) {
      updateTestStatus('warning', `⚠️ Partial: ${results.summary.passed} passed, ${results.summary.failed} failed, ${results.summary.skipped} skipped`);
      updateChromeAIStatus('warning', '⚠️ Chrome AI Partially Working');
    } else {
      updateTestStatus('error', '❌ Chrome AI not available. Please enable in chrome://flags');
      updateChromeAIStatus('error', '❌ Chrome AI Not Available');
    }
    
  } catch (error) {
    updateTestStatus('error', `❌ Test failed: ${error.message}`);
    outputDiv.innerHTML = `<pre style="color: #f44336;">Error: ${error.message}</pre>`;
    updateChromeAIStatus('error', '❌ Chrome AI Error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> Full Test (30s)';
  }
}

// Check APIs
async function runCheckAPIs() {
  const btn = document.getElementById('checkAPIsBtn');
  const resultsDiv = document.getElementById('aiTestResults');
  const outputDiv = document.getElementById('testOutput');
  
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Checking...';
  resultsDiv.style.display = 'block';
  outputDiv.innerHTML = '';
  
  updateTestStatus('info', '📊 Checking API capabilities...');
  
  try {
    const apis = await window.chromeAI.checkAIAPIs();
    
    // Format output
    let output = '═══════════════════════════════════════\n';
    output += '📊 CHROME AI APIs STATUS\n';
    output += '═══════════════════════════════════════\n\n';
    
    for (const [name, info] of Object.entries(apis)) {
      const icon = info.available ? '✅' : (info.exists ? '⏭️' : '❌');
      output += `${icon} ${name}\n`;
      output += `   Exists: ${info.exists}\n`;
      output += `   Available: ${info.available}\n`;
      output += `   Status: ${info.status}\n`;
      if (info.defaultTemperature !== undefined) {
        output += `   Default Temp: ${info.defaultTemperature}\n`;
        output += `   Max TopK: ${info.maxTopK}\n`;
      }
      output += '\n';
    }
    
    outputDiv.innerHTML = `<pre>${output}</pre>`;
    
    // Check if any API is available
    const hasWorkingAPI = Object.values(apis).some(api => api.available);
    const hasLegacyAPI = apis.globalLanguageModel?.available || apis.createTextSession?.available;
    
    if (hasWorkingAPI) {
      if (apis.languageModel?.available) {
        updateTestStatus('success', '✅ Chrome AI ready! Using modern window.ai.languageModel');
        updateChromeAIStatus('success', '✅ Chrome AI Available (Modern)');
      } else if (hasLegacyAPI) {
        updateTestStatus('success', '✅ Chrome AI ready! Using legacy LanguageModel API');
        updateChromeAIStatus('success', '✅ Chrome AI Available (Legacy)');
        
        // Add helpful note to output
        outputDiv.innerHTML += `\n<div style="background: #e3f2fd; padding: 12px; border-radius: 6px; margin-top: 10px; color: #1976d2;">
<strong>ℹ️ Note:</strong> You're using the legacy LanguageModel API, which works great!
<br>The extension will automatically use this API.
<br><br>
<strong>To get the latest APIs:</strong>
<br>• Make sure you're on Chrome 127+
<br>• Go to chrome://flags
<br>• Enable "Optimization Guide On Device Model" → "Enabled BypassPerfRequirement"
<br>• Restart Chrome
</div>`;
      } else {
        updateTestStatus('success', '✅ Chrome AI APIs checked successfully');
        updateChromeAIStatus('success', '✅ Chrome AI Available');
      }
    } else {
      updateTestStatus('warning', '⚠️ No AI APIs currently available');
      updateChromeAIStatus('warning', '⚠️ No AI APIs Available');
    }
    
  } catch (error) {
    updateTestStatus('error', `❌ Check failed: ${error.message}`);
    outputDiv.innerHTML = `<pre style="color: #f44336;">Error: ${error.message}</pre>`;
    updateChromeAIStatus('error', '❌ Error Checking APIs');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg> Check APIs';
  }
}

// Update test status
function updateTestStatus(type, message) {
  const statusDiv = document.getElementById('testStatus');
  if (!statusDiv) return;
  
  const icons = {
    info: '⏳',
    success: '✅',
    warning: '⚠️',
    error: '❌'
  };
  
  const colors = {
    info: '#2196f3',
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336'
  };
  
  statusDiv.innerHTML = `
    <span class="status-icon">${icons[type]}</span>
    <span class="status-text">${message}</span>
  `;
  statusDiv.style.background = colors[type];
}

// Update Chrome AI status badge
function updateChromeAIStatus(type, message) {
  const statusBadge = document.getElementById('chromeAIStatus');
  if (!statusBadge) return;
  
  const icons = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    checking: '🔄'
  };
  
  const colors = {
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    checking: '#2196f3'
  };
  
  statusBadge.innerHTML = `
    <span class="badge-icon">${icons[type]}</span>
    <span class="badge-text">${message}</span>
  `;
  statusBadge.style.borderLeft = `4px solid ${colors[type]}`;
}

// Check Chrome AI status on load
async function checkChromeAIStatus() {
  const statusBadge = document.getElementById('chromeAIStatus');
  if (!statusBadge) return;
  
  try {
    if (window.chromeAI && window.chromeAI.checkPromptAPIAvailability) {
      const status = await window.chromeAI.checkPromptAPIAvailability();
      
      if (status.recommended) {
        // Determine if it's modern or legacy API
        const isLegacy = status.recommended === 'global LanguageModel' || 
                        status.recommended === 'window.ai.createTextSession';
        const label = isLegacy ? '(Legacy)' : '(Modern)';
        updateChromeAIStatus('success', `✅ Chrome AI Ready ${label}: ${status.recommended}`);
      } else {
        updateChromeAIStatus('warning', '⚠️ Chrome AI Not Detected');
      }
    } else {
      updateChromeAIStatus('error', '❌ AI Test Module Not Loaded');
    }
  } catch (error) {
    updateChromeAIStatus('error', '❌ Error Checking Status');
    console.error('Failed to check Chrome AI status:', error);
  }
}
