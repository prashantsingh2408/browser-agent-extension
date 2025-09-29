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
});
