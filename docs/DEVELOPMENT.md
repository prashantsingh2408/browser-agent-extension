# Development Guide

## Overview
This guide covers the development workflow, architecture, refactoring history, and best practices for contributing to the Browser Agent Extension.

---

## Project Structure

```
browser-agent-extension/
├── manifest.json              # Extension manifest
├── index.html                 # Web app entry point
├── sidepanel.html            # Extension side panel UI
├── offscreen.html            # Offscreen document
│
├── scripts/                   # JavaScript modules
│   ├── core/                 # Core application logic
│   │   ├── app-controller.js
│   │   └── module-loader.js
│   │
│   ├── features/             # Feature modules
│   │   ├── chat/            # Chat functionality
│   │   ├── memory/          # Memory management
│   │   ├── agent/           # AI agents
│   │   ├── mail/            # Email composition
│   │   └── webdev/          # Web development
│   │
│   ├── services/            # Shared services
│   │   └── ai-service.js   # AI API integration
│   │
│   ├── utils/               # Utility functions
│   │   ├── event-bus.js
│   │   ├── storage.js
│   │   ├── dom-helpers.js
│   │   └── logger.js
│   │
│   ├── modules/             # Shared modules
│   │   ├── ai.js
│   │   ├── chat.js
│   │   └── ui.js
│   │
│   ├── main.js              # Application entry point
│   ├── sidepanel.js         # Side panel logic
│   ├── background.js        # Service worker
│   └── content.js           # Content script
│
├── styles/                   # CSS files
│   ├── sidepanel.css
│   └── ux-enhancements.css
│
├── icons/                    # Extension icons
├── data/                     # Sample data
├── docs/                     # Documentation
└── experiments/              # AI API experiments
```

---

## Architecture

### Design Principles

1. **Modular Architecture**: Separated into logical, reusable modules
2. **Event-Driven Communication**: Loose coupling via event bus
3. **Single Responsibility**: Each module has one clear purpose
4. **Dependency Injection**: Services injected rather than hard-coded
5. **Progressive Enhancement**: Works without AI, enhanced with it

### Core Components

#### App Controller
Central orchestrator managing application lifecycle.

```javascript
class AppController {
  constructor() {
    this.modules = new Map();
    this.eventBus = new EventBus();
  }
  
  async initialize() {
    await this.loadModules();
    await this.setupEventListeners();
    await this.restoreState();
  }
  
  async loadModules() {
    // Dynamic module loading
  }
}
```

#### Event Bus
Pub/sub system for module communication.

```javascript
eventBus.on('chat:message', (data) => {
  // Handle chat message
});

eventBus.emit('chat:message', { text: 'Hello' });
```

#### Storage Manager
Unified interface for data persistence.

```javascript
const storage = new StorageManager();
await storage.set('key', value);
const value = await storage.get('key');
```

---

## Refactoring History

### V1.0 - Monolithic Architecture
- **Total Lines**: ~14,380
- **Issues**: Large files, tight coupling, hard to maintain
- **Largest File**: memory.js (4,274 lines)

### V2.0 - Modular Refactoring (Current)
- **Completed**: January 2024
- **Result**: Separated into 25+ focused modules
- **Benefits**: 
  - ✅ Easier testing
  - ✅ Better maintainability
  - ✅ Reusable components
  - ✅ Clear separation of concerns

### Key Improvements
1. **Code Organization**: From 4 large files to 25+ small modules
2. **Average Module Size**: Reduced from 1,027 to ~200 lines
3. **Event-Driven**: Replaced direct function calls with events
4. **Testability**: Each module independently testable
5. **Documentation**: Comprehensive docs for all modules

---

## Development Workflow

### Setup
```bash
# Clone repository
git clone <repository-url>
cd browser-agent-extension

# No build step required! Pure vanilla JS
```

### Testing Locally

#### As Extension
1. Open `chrome://extensions/`
2. Enable Developer mode
3. Click "Load unpacked"
4. Select project folder

#### As Web App
```bash
# Option 1: Python HTTP server
python3 -m http.server 8000

# Option 2: PHP server
php -S localhost:8000

# Option 3: Node.js http-server
npx http-server -p 8000
```

### Hot Reloading
For extension development:
1. Make changes to code
2. Click reload icon in `chrome://extensions/`
3. Test changes immediately

---

## Coding Standards

### JavaScript Style

```javascript
// Use modern ES6+ features
const features = [...new Set(items)];
const filtered = items.filter(item => item.active);

// Async/await over promises
async function fetchData() {
  const response = await fetch(url);
  return await response.json();
}

// Destructuring
const { name, age } = user;
const [first, ...rest] = array;

// Template literals
const message = `Hello ${name}, you are ${age} years old`;

// Arrow functions
const double = x => x * 2;
const sum = (a, b) => a + b;
```

### Naming Conventions

```javascript
// Classes: PascalCase
class ChatManager { }

// Functions/Methods: camelCase
function getUserData() { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const API_ENDPOINT = 'https://api.example.com';

// Private methods: _prefix
class Example {
  _privateMethod() { }
}

// Event names: feature:action
eventBus.emit('chat:message:sent', data);
```

### File Organization

```javascript
// 1. Imports (if using modules)
import { EventBus } from './event-bus.js';

// 2. Constants
const DEFAULT_CONFIG = { ... };

// 3. Class/Function definitions
class MyClass { ... }

// 4. Helper functions
function helperFunction() { ... }

// 5. Exports (if using modules)
export { MyClass };
```

### Comments

```javascript
/**
 * Calculate user's total score
 * @param {Object} user - User object
 * @param {number[]} scores - Array of scores
 * @returns {number} Total score
 */
function calculateTotal(user, scores) {
  return scores.reduce((sum, score) => sum + score, 0);
}

// Single-line comments for brief explanations
const result = doSomething(); // Why this is needed
```

---

## Module Development

### Creating a New Module

```javascript
// 1. Create file in appropriate directory
// scripts/features/my-feature/my-feature.js

/**
 * MyFeature module
 * Description of what this module does
 */
class MyFeature {
  constructor(eventBus, storage) {
    this.eventBus = eventBus;
    this.storage = storage;
    this.setupEventListeners();
  }
  
  setupEventListeners() {
    this.eventBus.on('my-feature:action', this.handleAction.bind(this));
  }
  
  async handleAction(data) {
    // Implementation
  }
  
  async initialize() {
    // Load saved state
    const state = await this.storage.get('my-feature-state');
    // Setup UI
    // Register handlers
  }
  
  async cleanup() {
    // Save state
    // Remove listeners
    // Clear resources
  }
}

// 2. Export for use
if (typeof module !== 'undefined') {
  module.exports = MyFeature;
}
```

### Module Guidelines

1. **Single Responsibility**: One clear purpose
2. **Dependency Injection**: Pass dependencies in constructor
3. **Event Communication**: Use event bus, not direct calls
4. **State Management**: Load/save state properly
5. **Error Handling**: Try/catch all async operations
6. **Cleanup**: Remove listeners and clear resources
7. **Documentation**: JSDoc comments for public methods

---

## Testing

### Manual Testing Checklist

- [ ] Feature works in extension mode
- [ ] Feature works in web app mode
- [ ] Works without Chrome AI (fallback)
- [ ] Works with Chrome AI enabled
- [ ] Error handling works correctly
- [ ] UI responds to user actions
- [ ] State persists across sessions
- [ ] No console errors
- [ ] Performance is acceptable

### Browser Compatibility

| Browser | Extension | Web App |
|---------|-----------|---------|
| Chrome | ✅ Full | ✅ Full |
| Edge | ✅ Full | ✅ Full |
| Firefox | ❌ N/A | ⚠️ Limited |
| Safari | ❌ N/A | ⚠️ Limited |

### Chrome AI Testing

1. Enable required flags in `chrome://flags`
2. Test with AI available
3. Test with AI unavailable (fallback)
4. Test error scenarios
5. Monitor console for errors

---

## Debugging

### Console Logging

```javascript
// Enable debug mode
window.AI_DEBUG = true;

// Use consistent logging
console.log('[FeatureName] Action performed:', data);
console.error('[FeatureName] Error occurred:', error);
console.warn('[FeatureName] Warning:', message);
```

### Chrome DevTools

```javascript
// Extension debugging
1. Right-click extension → "Inspect popup"
2. Or: chrome://extensions → "Inspect views"

// Service worker debugging
1. chrome://serviceworker-internals
2. Find your extension
3. Click "Inspect"
```

### Common Issues

#### Chrome AI Not Available
- Check Chrome version (Canary/Dev)
- Verify flags enabled
- Restart Chrome completely

#### Extension Not Loading
- Check manifest.json syntax
- Verify all files exist
- Check console for errors

#### State Not Persisting
- Verify storage permissions in manifest
- Check storage.local vs storage.sync
- Ensure proper async/await usage

---

## Performance Optimization

### Best Practices

1. **Debounce User Input**
```javascript
const debouncedHandler = debounce(handler, 300);
input.addEventListener('input', debouncedHandler);
```

2. **Lazy Load Features**
```javascript
async function loadFeature(name) {
  if (!features.has(name)) {
    const module = await import(`./features/${name}.js`);
    features.set(name, new module.default());
  }
  return features.get(name);
}
```

3. **Cache API Responses**
```javascript
const cache = new Map();
async function fetchWithCache(key, fetcher) {
  if (cache.has(key)) return cache.get(key);
  const result = await fetcher();
  cache.set(key, result);
  return result;
}
```

4. **Use Virtual Scrolling for Long Lists**
```javascript
// Only render visible items
const visibleItems = items.slice(startIndex, endIndex);
```

---

## Deployment

### Building for Production

No build step required! The extension uses vanilla JavaScript.

### Creating Release Package

```bash
# Create zip file
cd /path/to/project/parent
zip -r browser-agent-extension.zip browser-agent-extension/ \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "*__pycache__*" \
  -x "*.md" \
  -x "experiments/*" \
  -x "docs/*"
```

### Chrome Web Store Submission

1. Create zip package (see above)
2. Go to [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Click "New Item"
4. Upload zip file
5. Fill in store listing details
6. Submit for review

---

## Contributing

### Contribution Workflow

1. Fork the repository
2. Create feature branch: `git checkout -b feature/my-feature`
3. Make changes
4. Test thoroughly (see checklist above)
5. Commit: `git commit -m "Add my feature"`
6. Push: `git push origin feature/my-feature`
7. Create Pull Request

### Pull Request Guidelines

- Clear description of changes
- Link to related issues
- Screenshots/videos of UI changes
- Test results
- No linter errors
- Documentation updated

### Code Review Checklist

- [ ] Code follows style guide
- [ ] No console errors
- [ ] Documentation updated
- [ ] Tests pass
- [ ] Performance acceptable
- [ ] Backwards compatible
- [ ] Accessible (a11y)

---

## Resources

### Internal Documentation
- [Getting Started](GETTING-STARTED.md)
- [Features](FEATURES.md)
- [API Guides](API-GUIDES.md)
- [Architecture](ARCHITECTURE.md)
- [Experiments](EXPERIMENTS.md)

### External Resources
- [Chrome Extensions Documentation](https://developer.chrome.com/docs/extensions/)
- [Chrome AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)

---

## Future Improvements

### Planned Features
- [ ] Automated testing suite
- [ ] CI/CD pipeline
- [ ] Performance monitoring
- [ ] Usage analytics (privacy-preserving)
- [ ] Plugin system
- [ ] Internationalization (i18n)

### Technical Debt
- [ ] Migrate to TypeScript (optional)
- [ ] Add unit tests
- [ ] Implement E2E tests
- [ ] Setup linting automation
- [ ] Add pre-commit hooks

---

## Getting Help

### Internal Support
- Check documentation first
- Search existing issues
- Ask in project discussions

### External Support
- [Stack Overflow](https://stackoverflow.com/questions/tagged/chrome-extensions)
- [Chrome Extensions Google Group](https://groups.google.com/a/chromium.org/g/chromium-extensions)
- [Chrome AI Discord](https://discord.gg/chrome-ai)

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

