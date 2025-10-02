# Quick Start Guide - Modular Architecture

## 🚀 Get Started in 5 Minutes

### Option 1: View Example
```bash
# Open the example in your browser
open example-modular.html
# or
python3 -m http.server 8000
# Then visit: http://localhost:8000/example-modular.html
```

### Option 2: Use Existing HTML
Update your HTML to use the new modular system:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My App</title>
</head>
<body>
  <!-- Your UI here -->
  
  <!-- Load modules in order (critical!) -->
  <script src="scripts/utils/logger.js"></script>
  <script src="scripts/utils/event-bus.js"></script>
  <script src="scripts/utils/storage.js"></script>
  <script src="scripts/utils/dom-helpers.js"></script>
  <script src="scripts/services/ai-service.js"></script>
  <script src="scripts/features/chat/chat-manager.js"></script>
  <script src="scripts/features/chat/chat-ui.js"></script>
  <script src="scripts/core/app-controller.js"></script>
  <script src="scripts/main.js"></script>
  
  <script>
    // Wait for app to be ready
    window.EventBus.on('app:ready', () => {
      console.log('App is ready!');
      // Your code here
    });
  </script>
</body>
</html>
```

## 📚 Common Tasks

### Send a Chat Message

```javascript
// Get chat manager
const { addMessage, getCurrentSession } = ChatManager;

// Get current session
const session = getCurrentSession();

// Add user message
addMessage(session.id, 'user', 'Hello!');

// Listen for AI response
EventBus.on('chat:message-added', (data) => {
  if (data.message.role === 'assistant') {
    console.log('AI said:', data.message.content);
  }
});

// Render messages
ChatUI.renderMessages();
```

### Save and Load Data

```javascript
// Save data
await StorageManager.set('my_data', {
  name: 'John',
  preferences: { theme: 'dark' }
});

// Load data
const data = await StorageManager.get('my_data');
console.log(data.name); // 'John'

// Save with expiration (1 hour)
await StorageManager.set('temp', value, { ttl: 3600000 });
```

### Create a Memory

```javascript
// Create memory
const memory = MemoryStorage.createMemory(
  'Meeting Notes',
  'Important meeting discussion...',
  'work',
  ['meeting', 'important']
);

// Search memories
const results = MemorySearch.searchMemories('meeting');

// Filter by category
const workMemories = MemorySearch.filterByCategory('work');
```

### Use Events

```javascript
// Subscribe to event
EventBus.on('user:action', (data) => {
  console.log('User did something:', data);
});

// Emit event
EventBus.emit('user:action', { action: 'click', target: 'button' });

// Subscribe once
EventBus.once('app:initialized', () => {
  console.log('This runs only once');
});

// Unsubscribe
const unsubscribe = EventBus.on('event', handler);
unsubscribe(); // Stop listening
```

### Log Messages

```javascript
// Basic logging
Logger.info('Application started');
Logger.warn('Something might be wrong');
Logger.error('An error occurred');
Logger.success('Operation completed!');

// Create child logger with context
const myLogger = Logger.createChild('MyFeature');
myLogger.info('This is from MyFeature');

// Group logs
Logger.group('Processing Items');
items.forEach(item => Logger.info('Processing:', item));
Logger.groupEnd();
```

### DOM Manipulation

```javascript
// Query elements
const element = DOMHelpers.$('#myElement');
const elements = DOMHelpers.$$('.my-class');

// Create element
const div = DOMHelpers.createElement('div', {
  className: 'my-div',
  dataset: { id: '123' }
}, ['Hello World']);

// Utilities
DOMHelpers.show(element);
DOMHelpers.hide(element);
DOMHelpers.addClass(element, 'active');
DOMHelpers.scrollTo(element);

// Animate
DOMHelpers.animate(element, [
  { opacity: 0 },
  { opacity: 1 }
], { duration: 300 });

// Copy to clipboard
await DOMHelpers.copyToClipboard('Text to copy');

// Format utilities
const size = DOMHelpers.formatFileSize(1234567); // "1.18 MB"
const date = DOMHelpers.formatDate(new Date(), 'relative'); // "just now"
const id = DOMHelpers.generateId('user'); // "user_1696262400000_abc123"
```

## 🎯 Creating a New Feature

### Step 1: Create Feature Structure
```bash
mkdir -p scripts/features/my-feature
```

### Step 2: Create Manager
```javascript
// scripts/features/my-feature/my-feature-manager.js
import storage from '../../utils/storage.js';
import logger from '../../utils/logger.js';
import eventBus from '../../utils/event-bus.js';

const myLogger = logger.createChild('MyFeature');

export async function initializeMyFeature() {
  myLogger.info('Initializing...');
  
  // Load saved data
  const data = await storage.get('my_feature_data', {});
  
  // Setup event listeners
  eventBus.on('my-feature:action', handleAction);
  
  myLogger.success('Initialized');
}

async function handleAction(data) {
  myLogger.debug('Handling action:', data);
  
  // Do work
  const result = processData(data);
  
  // Save
  await storage.set('my_feature_data', result);
  
  // Notify
  eventBus.emit('my-feature:complete', result);
}

function processData(data) {
  // Business logic here
  return { processed: true, data };
}
```

### Step 3: Create UI
```javascript
// scripts/features/my-feature/my-feature-ui.js
import { $, createElement, show, hide } from '../../utils/dom-helpers.js';
import eventBus from '../../utils/event-bus.js';

export function renderMyFeature() {
  const container = $('#myFeatureContainer');
  
  const content = createElement('div', {
    className: 'my-feature-content'
  }, ['Feature content here']);
  
  container.appendChild(content);
}

export function updateUI(data) {
  const status = $('#myFeatureStatus');
  status.textContent = `Status: ${data.status}`;
}

// Listen for events
eventBus.on('my-feature:complete', (result) => {
  updateUI(result);
});
```

### Step 4: Add to HTML
```html
<!-- Add container -->
<div id="myFeatureContainer"></div>
<div id="myFeatureStatus"></div>

<!-- Load scripts -->
<script src="scripts/features/my-feature/my-feature-manager.js"></script>
<script src="scripts/features/my-feature/my-feature-ui.js"></script>

<script>
  // Initialize when ready
  EventBus.on('app:ready', async () => {
    await MyFeatureManager.initializeMyFeature();
    MyFeatureUI.renderMyFeature();
  });
</script>
```

## 🐛 Debugging

### Check App Status
```javascript
// In browser console
window.APP
// Shows: ready, features, config, etc.

window.AppController.getStatus()
// Shows: initialized, features, AI capabilities
```

### View Logs
```javascript
// Get log history
Logger.getHistory()

// Get only errors
Logger.getHistory('error')

// Enable debug mode
Logger.setLevel('debug')
```

### Monitor Events
```javascript
// Enable event bus debugging
EventBus.setDebug(true)

// All events will be logged to console
```

### Check Storage
```javascript
// View all stored keys
await StorageManager.keys()

// Get storage usage (extension only)
await StorageManager.getUsage()

// Clear storage
await StorageManager.clear()
```

## 🔧 Configuration

### Enable Debug Mode
```javascript
// In main.js or your init code
if (window.Logger) {
  Logger.setLevel('debug');
  Logger.enable();
}

if (window.EventBus) {
  EventBus.setDebug(true);
}
```

### Custom App Config
```javascript
window.APP.config = {
  name: 'My Custom App',
  version: '1.0.0',
  debug: true,
  features: ['chat', 'memory'],
  theme: 'dark'
};
```

## 📖 Learn More

- **Full Documentation**: [REFACTORING.md](REFACTORING.md)
- **Architecture Guide**: [ARCHITECTURE.md](ARCHITECTURE.md)
- **Example App**: [example-modular.html](example-modular.html)
- **Main README**: [README.md](README.md)

## 🆘 Troubleshooting

### Module Not Found
**Problem**: `Cannot find module 'xxx'`

**Solution**: Check loading order in HTML. Utils must load first.

```html
<!-- Correct order -->
<script src="scripts/utils/logger.js"></script>
<script src="scripts/utils/event-bus.js"></script>
<script src="scripts/utils/storage.js"></script>
<!-- Then other modules -->
```

### Events Not Working
**Problem**: Events not being received

**Solution**: Make sure EventBus is loaded and listener is set before emit:

```javascript
// Wrong - listener after emit
EventBus.emit('my-event', data);
EventBus.on('my-event', handler); // Won't receive

// Correct - listener before emit
EventBus.on('my-event', handler);
EventBus.emit('my-event', data); // Will receive
```

### Storage Not Persisting
**Problem**: Data not saving

**Solution**: Check if storage is initialized and await async operations:

```javascript
// Wrong - not awaiting
StorageManager.set('data', value); // Might not complete

// Correct - await async
await StorageManager.set('data', value); // Completes
```

### UI Not Updating
**Problem**: UI doesn't reflect changes

**Solution**: Make sure event listeners are set up:

```javascript
// Listen for data changes
EventBus.on('data:updated', (data) => {
  // Update UI here
  renderUI(data);
});

// Emit when data changes
await storage.set('data', newValue);
EventBus.emit('data:updated', newValue);
```

## 💡 Tips & Best Practices

1. **Always await storage operations**
2. **Use event bus for cross-module communication**
3. **Create child loggers for context**: `Logger.createChild('MyModule')`
4. **Debounce frequent operations**: `DOMHelpers.debounce(fn, 300)`
5. **Check app ready before using features**: `EventBus.on('app:ready', ...)`
6. **Use try-catch for async operations**
7. **Emit events for state changes**
8. **Keep modules under 300 lines**
9. **Document public APIs with comments**
10. **Test each module independently**

## 🎓 Next Steps

1. ✅ Read this Quick Start
2. 📖 Review [REFACTORING.md](REFACTORING.md)
3. 🏗️ Understand [ARCHITECTURE.md](ARCHITECTURE.md)
4. 🧪 Try [example-modular.html](example-modular.html)
5. 🚀 Build your own feature!

---

**Need Help?** Check the documentation or console logs for debugging info.

**Found a Bug?** Open an issue with steps to reproduce.

**Have Ideas?** Contributions welcome! See CONTRIBUTING.md

