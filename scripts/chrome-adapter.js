// Chrome Extension API Adapter for Web App
// Makes the same code work in both extension and web contexts

console.log('🔧 Chrome Adapter loading...');

// Detect if running in extension context
const isExtension = typeof chrome !== 'undefined' && chrome.storage;
const isWebApp = !isExtension;

console.log('Running as:', isExtension ? 'Chrome Extension' : 'Web App');

// Create chrome API polyfill for web app
if (isWebApp) {
  console.log('📦 Creating Chrome API polyfill...');
  
  window.chrome = {
    storage: {
      local: {
        async get(keys) {
          console.log('Storage GET:', keys);
          const result = {};
          if (typeof keys === 'string') keys = [keys];
          
          keys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
              try {
                result[key] = JSON.parse(item);
              } catch (e) {
                result[key] = item;
              }
            }
          });
          
          return Promise.resolve(result);
        },
        
        async set(items) {
          console.log('Storage SET:', Object.keys(items));
          Object.keys(items).forEach(key => {
            localStorage.setItem(key, JSON.stringify(items[key]));
          });
          return Promise.resolve();
        },
        
        async remove(keys) {
          if (typeof keys === 'string') keys = [keys];
          keys.forEach(key => localStorage.removeItem(key));
          return Promise.resolve();
        },
        
        async clear() {
          localStorage.clear();
          return Promise.resolve();
        }
      }
    },
    
    tabs: {
      async query(queryInfo) {
        // Return current page info
        return Promise.resolve([{
          url: window.location.href,
          title: document.title,
          id: 1,
          active: true,
          favIconUrl: null
        }]);
      },
      
      async captureVisibleTab(windowId, options) {
        // Use html2canvas for web app screenshots
        if (typeof html2canvas === 'undefined') {
          console.warn('html2canvas not loaded. Load from CDN for screenshots.');
          throw new Error('Screenshot library not loaded');
        }
        
        console.log('📸 Capturing page with html2canvas...');
        const canvas = await html2canvas(document.body, {
          useCORS: true,
          logging: false
        });
        
        return canvas.toDataURL('image/png');
      }
    }
  };
  
  // Add Chrome AI APIs polyfill
  window.ai = {
    languageModel: {
      create: async (options = {}) => {
        console.log('🤖 AI Language Model (stub) - options:', options);
        return {
          prompt: async (text) => {
            console.log('🤖 AI Prompt (stub):', text.substring(0, 100));
            // Return a simple response for web app demo
            if (text.includes('narrative') || text.includes('storyteller')) {
              return `This beautiful memory captures a special moment in your journey. The way you've preserved this experience shows how much it means to you, and it's wonderful to revisit these precious moments that shape who you are.`;
            }
            return `This is a demo response to your query. In a real deployment, this would use an external AI API.`;
          },
          destroy: () => {
            console.log('🤖 AI Session destroyed (stub)');
          }
        };
      }
    },
    
    // Chrome Summarizer API stub
    summarizer: {
      create: async (options = {}) => {
        console.log('📝 AI Summarizer (stub) - options:', options);
        return {
          summarize: async (text) => {
            console.log('📝 AI Summarize (stub):', text.substring(0, 100));
            // Simple summarization for demo
            const sentences = text.split('.').filter(s => s.trim().length > 0);
            const summary = sentences.slice(0, 2).join('. ') + '.';
            return summary || 'Summary of the provided text.';
          },
          destroy: () => {
            console.log('📝 AI Summarizer destroyed (stub)');
          }
        };
      }
    },
    
    // Chrome Translator API stub  
    translator: {
      create: async (options = {}) => {
        console.log('🌐 AI Translator (stub) - options:', options);
        return {
          translate: async (text) => {
            console.log('🌐 AI Translate (stub):', text.substring(0, 50));
            // Simple translation demo (just return original for now)
            return `[Translated] ${text}`;
          },
          destroy: () => {
            console.log('🌐 AI Translator destroyed (stub)');
          }
        };
      }
    },
    
    // Chrome Proofreader API stub
    proofreader: {
      create: async (options = {}) => {
        console.log('✏️ AI Proofreader (stub) - options:', options);
        return {
          proofread: async (text) => {
            console.log('✏️ AI Proofread (stub):', text.substring(0, 50));
            // Simple proofreading demo
            const corrected = text
              .replace(/\bi\b/g, 'I')  // Capitalize 'i'
              .replace(/\s+/g, ' ')    // Fix multiple spaces
              .trim();
            return corrected;
          },
          destroy: () => {
            console.log('✏️ AI Proofreader destroyed (stub)');
          }
        };
      }
    }
  };
  
  console.log('✅ Chrome API polyfill created');
}

// Web App specific utilities
if (isWebApp) {
  // Add html2canvas for screenshots
  if (!window.html2canvas) {
    console.log('📥 Loading html2canvas library...');
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => console.log('✅ html2canvas loaded');
    document.head.appendChild(script);
  }
  
  // Show web app indicator
  setTimeout(() => {
    const indicator = document.createElement('div');
    indicator.className = 'webapp-indicator';
    indicator.innerHTML = '🌐 Web App Mode';
    indicator.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      z-index: 9999;
      animation: slideIn 0.5s ease-out;
    `;
    document.body.appendChild(indicator);
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      indicator.style.opacity = '0';
      indicator.style.transform = 'translateX(100px)';
      setTimeout(() => indicator.remove(), 500);
    }, 3000);
  }, 1000);
}

// Export detection flag
window.IS_EXTENSION = isExtension;
window.IS_WEBAPP = isWebApp;

console.log('✅ Chrome Adapter ready!');

