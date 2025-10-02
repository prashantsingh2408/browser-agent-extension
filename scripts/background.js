// Background script for AI Assistant with enhanced functionality

// Set up side panel behavior on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('Error setting panel behavior:', error));
});

// Open side panel when extension icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
});

// Handle keyboard shortcut
chrome.commands.onCommand.addListener(async (command) => {
  if (command === '_execute_action') {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.sidePanel.open({ tabId: tab.id });
    } catch (error) {
      console.error('Error opening side panel via shortcut:', error);
    }
  }
});

// Handle messages from content scripts and sidepanel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'captureScreenshot') {
    handleScreenshot(request.selector)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'executeInActiveTab') {
    executeInActiveTab(request.function, request.parameters)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
  
  if (request.action === 'getTabInfo') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      sendResponse({ tab: tabs[0] });
    });
    return true;
  }
  
  if (request.action === 'saveWebMemory') {
    handleWebMemorySave(request.memory)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true;
  }
});

// Handle screenshot capture
async function handleScreenshot(selector) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (selector) {
      // If selector is provided, need to highlight element first
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'highlightElement', 
        selector: selector 
      });
    }
    
    // Capture visible tab
    const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
      quality: 90
    });
    
    if (selector) {
      // Remove highlight
      await chrome.tabs.sendMessage(tab.id, { 
        action: 'removeHighlight' 
      });
    }
    
    return { 
      success: true, 
      dataUrl: dataUrl,
      message: 'Screenshot captured successfully'
    };
  } catch (error) {
    console.error('Screenshot error:', error);
    return { 
      error: `Failed to capture screenshot: ${error.message}` 
    };
  }
}

// Execute function in active tab
async function executeInActiveTab(functionName, parameters) {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if we can inject into this tab
    if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      return { error: 'Cannot access browser internal pages' };
    }
    
    // Send message to content script
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: 'executeFunction',
      function: functionName,
      parameters: parameters
    });
    
    return response;
  } catch (error) {
    console.error('Error executing in active tab:', error);
    
    // Try to inject content script if it's not loaded
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['scripts/content.js']
      });
      
      // Retry the function execution
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'executeFunction',
        function: functionName,
        parameters: parameters
      });
      
      return response;
    } catch (injectError) {
      return { error: `Failed to access page: ${injectError.message}` };
    }
  }
}

// Handle web memory save
async function handleWebMemorySave(memory) {
  try {
    // Get existing memories
    const result = await chrome.storage.local.get(['memories']);
    const memories = result.memories || {};
    
    // Add new web memory
    memories[memory.id] = memory;
    
    // Save back to storage
    await chrome.storage.local.set({ memories: memories });
    
    console.log('Web memory saved:', memory.title);
    return { success: true, id: memory.id };
  } catch (error) {
    console.error('Error saving web memory:', error);
    throw error;
  }
}

// Listen for tab updates to reinject content script if needed
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && !tab.url.startsWith('chrome://')) {
    // Optionally reinject content script on page navigation
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['scripts/content.js', 'scripts/web-capture.js']
    }).catch(() => {
      // Silently fail if injection is not allowed
    });
  }
});