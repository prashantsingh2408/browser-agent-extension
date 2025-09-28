// Function system for Quick Action Buttons
// This module manages functions available through the buttons

// Function definitions
const AVAILABLE_FUNCTIONS = {
  getPageContent: {
    name: 'getPageContent',
    description: 'Get the main content of the current webpage',
    parameters: {
      selector: {
        type: 'string',
        description: 'Optional CSS selector to get specific content',
        required: false
      },
      includeMetadata: {
        type: 'boolean', 
        description: 'Include page metadata like title, URL',
        required: false,
        default: true
      }
    },
    returns: 'Object with page content and metadata'
  },
  
  getSelectedText: {
    name: 'getSelectedText',
    description: 'Get currently selected text on the page',
    parameters: {},
    returns: 'Selected text string'
  },
  
  getPageMetadata: {
    name: 'getPageMetadata',
    description: 'Get metadata about the current page (title, URL, description, etc.)',
    parameters: {},
    returns: 'Object with page metadata'
  },
  
  findElements: {
    name: 'findElements',
    description: 'Find elements on the page using CSS selector',
    parameters: {
      selector: {
        type: 'string',
        description: 'CSS selector to find elements',
        required: true
      },
      limit: {
        type: 'number',
        description: 'Maximum number of elements to return',
        required: false,
        default: 10
      },
      extractText: {
        type: 'boolean',
        description: 'Extract text content from elements',
        required: false,
        default: true
      }
    },
    returns: 'Array of element data'
  },
  
  getImages: {
    name: 'getImages',
    description: 'Get all images from the current page',
    parameters: {
      includeBackgroundImages: {
        type: 'boolean',
        description: 'Include CSS background images',
        required: false,
        default: false
      }
    },
    returns: 'Array of image URLs and metadata'
  },
  
  getLinks: {
    name: 'getLinks',
    description: 'Get all links from the current page',
    parameters: {
      internal: {
        type: 'boolean',
        description: 'Only internal links',
        required: false
      },
      external: {
        type: 'boolean',
        description: 'Only external links',
        required: false
      }
    },
    returns: 'Array of link data'
  },
  
  getVideos: {
    name: 'getVideos',
    description: 'Find all videos on the current page',
    parameters: {},
    returns: 'Array of video information'
  },
  
  getForms: {
    name: 'getForms',
    description: 'Get information about forms on the page',
    parameters: {},
    returns: 'Array of form data'
  },
  
  clickElement: {
    name: 'clickElement',
    description: 'Click on an element matching the selector',
    parameters: {
      selector: {
        type: 'string',
        description: 'CSS selector for element to click',
        required: true
      }
    },
    returns: 'Success status'
  },
  
  fillInput: {
    name: 'fillInput',
    description: 'Fill an input field with text',
    parameters: {
      selector: {
        type: 'string',
        description: 'CSS selector for input field',
        required: true
      },
      value: {
        type: 'string',
        description: 'Value to fill in the input',
        required: true
      }
    },
    returns: 'Success status'
  },
  
  scrollToElement: {
    name: 'scrollToElement',
    description: 'Scroll to a specific element on the page',
    parameters: {
      selector: {
        type: 'string',
        description: 'CSS selector for element to scroll to',
        required: true
      },
      smooth: {
        type: 'boolean',
        description: 'Use smooth scrolling',
        required: false,
        default: true
      }
    },
    returns: 'Success status'
  },
  
  extractTable: {
    name: 'extractTable',
    description: 'Extract data from tables on the page',
    parameters: {
      selector: {
        type: 'string',
        description: 'CSS selector for specific table (optional)',
        required: false
      },
      format: {
        type: 'string',
        description: 'Output format: json, csv, or text',
        required: false,
        default: 'json'
      }
    },
    returns: 'Table data in specified format'
  },
  
  takeScreenshot: {
    name: 'takeScreenshot',
    description: 'Take a screenshot of the visible page area',
    parameters: {
      selector: {
        type: 'string',
        description: 'CSS selector for specific element to screenshot',
        required: false
      }
    },
    returns: 'Screenshot data URL'
  },
  
  analyzePageStructure: {
    name: 'analyzePageStructure',
    description: 'Analyze the structure and layout of the page',
    parameters: {},
    returns: 'Page structure analysis'
  },
  
  searchInPage: {
    name: 'searchInPage',
    description: 'Search for text within the page content',
    parameters: {
      query: {
        type: 'string',
        description: 'Text to search for',
        required: true
      },
      caseSensitive: {
        type: 'boolean',
        description: 'Case sensitive search',
        required: false,
        default: false
      },
      wholeWord: {
        type: 'boolean',
        description: 'Match whole words only',
        required: false,
        default: false
      }
    },
    returns: 'Array of matches with context'
  }
};


// Execute a function call
async function executeFunction(functionName, parameters = {}) {
  if (!AVAILABLE_FUNCTIONS[functionName]) {
    throw new Error(`Unknown function: ${functionName}`);
  }
  
  try {
    // Get current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Check if tab is accessible
    if (!tab || tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-extension://')) {
      throw new Error('Cannot access browser internal pages. Please navigate to a regular website.');
    }
    
    // Try to send message to content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'executeFunction',
        function: functionName,
        parameters: parameters
      });
      
      if (response && response.error) {
        throw new Error(response.error);
      }
      
      return response.result;
    } catch (sendError) {
      console.log('Content script not found, injecting it now...');
      
      // Try to inject content script if it's not loaded
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['scripts/content.js']
        });
        
        // Wait a moment for script to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Retry sending the message
        const response = await chrome.tabs.sendMessage(tab.id, {
          action: 'executeFunction',
          function: functionName,
          parameters: parameters
        });
        
        if (response && response.error) {
          throw new Error(response.error);
        }
        
        return response.result;
      } catch (injectError) {
        console.error('Failed to inject content script:', injectError);
        throw new Error('Failed to access the page. Please refresh the page and try again.');
      }
    }
  } catch (error) {
    console.error(`Error executing function ${functionName}:`, error);
    throw error;
  }
}


// Global object for functions (accessible for buttons)
window.functionHandler = {
  AVAILABLE_FUNCTIONS,
  executeFunction
};
