# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser Agent Extension                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Application Layer (main.js)             │   │
│  │  - Initialization                                     │   │
│  │  - Error Handling                                     │   │
│  │  - Global Configuration                               │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌─────────────────▼───────────────────────────────────┐   │
│  │         Core Layer (core/)                           │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │ AppController│  │ ModuleLoader │                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌─────────────────▼───────────────────────────────────┐   │
│  │         Services Layer (services/)                   │   │
│  │  ┌──────────────┐  ┌──────────────┐                │   │
│  │  │  AI Service  │  │ More Services│                │   │
│  │  └──────────────┘  └──────────────┘                │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌─────────────────▼───────────────────────────────────┐   │
│  │         Features Layer (features/)                   │   │
│  │  ┌──────┐ ┌────────┐ ┌──────┐ ┌───────┐ ┌────────┐ │   │
│  │  │ Chat │ │ Memory │ │ Agent│ │ Mail  │ │ WebDev │ │   │
│  │  └──────┘ └────────┘ └──────┘ └───────┘ └────────┘ │   │
│  │    Each feature contains:                            │   │
│  │    - Manager (business logic)                        │   │
│  │    - UI (interface)                                  │   │
│  │    - Storage (data)                                  │   │
│  └──────────────────┬───────────────────────────────────┘   │
│                     │                                         │
│  ┌─────────────────▼───────────────────────────────────┐   │
│  │         Utilities Layer (utils/)                     │   │
│  │  ┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐  │   │
│  │  │ EventBus │ │ Storage │ │ Logger │ │DOMHelpers│  │   │
│  │  └──────────┘ └─────────┘ └────────┘ └──────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### Message Flow (Chat Feature)
```
User Input
    ↓
Chat UI (chat-ui.js)
    ↓
Event: 'chat:send-message'
    ↓
Chat Manager (chat-manager.js)
    ↓
AI Service (ai-service.js)
    ↓
Storage Manager (storage.js)
    ↓
Event: 'chat:message-added'
    ↓
Chat UI (updates display)
```

### Event Flow
```
Component A                  Event Bus              Component B
    │                           │                        │
    ├──emit('event')───────────>│                        │
    │                           ├──notifies──────────────>│
    │                           │                        │
    │                           │                        ├──processes
    │                           │                        │
    │                           │<──emit('result')───────┤
    ├<──notifies────────────────┤                        │
    │                           │                        │
```

---

## Core Design Principles

### 1. Separation of Concerns
- **Business Logic** → `features/*/manager.js`
- **UI Logic** → `features/*/ui.js`
- **Data Storage** → `features/*/storage.js`
- **Utilities** → `utils/`
- **Services** → `services/`

### 2. Event-Driven Architecture
All inter-module communication happens through the Event Bus:

```javascript
// Producer
eventBus.emit('user:action', data);

// Consumer
eventBus.on('user:action', (data) => {
  handleAction(data);
});
```

**Benefits:**
- ✅ Loose coupling
- ✅ Easy to test
- ✅ Easy to extend
- ✅ Clear data flow

### 3. Single Responsibility
Each module does one thing well:

```javascript
// ❌ Bad: Mixed concerns
class UserManager {
  fetchUser() { ... }
  renderUserUI() { ... }
  saveToStorage() { ... }
}

// ✅ Good: Separated concerns
class UserManager {
  fetchUser() { ... }
}

class UserUI {
  renderUser() { ... }
}

class UserStorage {
  saveUser() { ... }
}
```

### 4. Dependency Injection
Services are injected, not hard-coded:

```javascript
// ❌ Bad: Hard dependency
import { fetchData } from './api.js';

class MyFeature {
  async loadData() {
    return await fetchData();
  }
}

// ✅ Good: Injected dependency
class MyFeature {
  constructor(apiService) {
    this.api = apiService;
  }
  
  async loadData() {
    return await this.api.fetchData();
  }
}
```

---

## Module Lifecycle

### 1. Initialization Phase
```
main.js loads
    ↓
Core utilities load (logger, eventBus, storage)
    ↓
Services initialize (aiService)
    ↓
App Controller initializes
    ↓
Features load on-demand
    ↓
App ready event emitted
```

### 2. Runtime Phase
```
User interacts with UI
    ↓
UI emits event
    ↓
Manager handles business logic
    ↓
Storage persists data
    ↓
UI updates via event
```

### 3. Cleanup Phase
```
Feature cleanup requested
    ↓
Event listeners removed
    ↓
Resources released
    ↓
Storage saved
```

---

## Module Dependencies

### Dependency Graph
```
main.js
  └── core/app-controller.js
      ├── services/ai-service.js
      │   └── utils/logger.js
      │   └── utils/event-bus.js
      │
      ├── features/chat/chat-manager.js
      │   └── utils/storage.js
      │   └── utils/logger.js
      │   └── utils/event-bus.js
      │
      ├── features/chat/chat-ui.js
      │   └── utils/dom-helpers.js
      │   └── utils/logger.js
      │
      └── features/memory/memory-storage.js
          └── utils/storage.js
          └── utils/logger.js
```

### Loading Order
1. **Utils** (no dependencies)
   - logger.js
   - event-bus.js
   - storage.js
   - dom-helpers.js

2. **Services** (depend on utils)
   - ai-service.js

3. **Features** (depend on utils and services)
   - chat-manager.js
   - chat-ui.js
   - memory-storage.js
   - memory-search.js

4. **Core** (depends on everything)
   - app-controller.js

5. **Main** (entry point)
   - main.js

---

## Extension Points

### Adding a New Feature

1. **Create feature folder**
```bash
mkdir -p scripts/features/my-feature
```

2. **Create manager**
```javascript
// scripts/features/my-feature/my-feature-manager.js
import storage from '../../utils/storage.js';
import logger from '../../utils/logger.js';
import eventBus from '../../utils/event-bus.js';

export async function initializeMyFeature() {
  // Initialize feature
}

export function doSomething(data) {
  // Business logic
  eventBus.emit('my-feature:action', data);
}
```

3. **Create UI**
```javascript
// scripts/features/my-feature/my-feature-ui.js
import { createElement } from '../../utils/dom-helpers.js';
import eventBus from '../../utils/event-bus.js';

export function renderMyFeature() {
  // Render UI
}

// Listen for events
eventBus.on('my-feature:action', (data) => {
  updateUI(data);
});
```

4. **Register in App Controller**
```javascript
// In app-controller.js
case 'myFeature':
  const { initializeMyFeature } = await import('../features/my-feature/my-feature-manager.js');
  await initializeMyFeature();
  feature = { name: 'myFeature', loaded: true };
  break;
```

### Adding a New Service

```javascript
// scripts/services/my-service.js
import logger from '../utils/logger.js';
import eventBus from '../utils/event-bus.js';

class MyService {
  constructor() {
    this.logger = logger.createChild('MyService');
  }

  async initialize() {
    this.logger.info('Initializing...');
    // Setup
  }

  async doWork(data) {
    this.logger.debug('Processing:', data);
    // Business logic
    eventBus.emit('my-service:complete', result);
    return result;
  }
}

const myService = new MyService();
export default myService;

if (typeof window !== 'undefined') {
  window.MyService = myService;
}
```

---

## Performance Considerations

### Lazy Loading
Features load only when needed:

```javascript
// Feature loaded on first use
async function loadFeature(name) {
  if (!loadedFeatures.has(name)) {
    const module = await import(`./features/${name}/index.js`);
    loadedFeatures.set(name, module);
  }
  return loadedFeatures.get(name);
}
```

### Caching
Storage manager includes caching:

```javascript
// First call: ~10ms (storage)
await storage.get('data');

// Second call: ~0.1ms (cache)
await storage.get('data');
```

### Event Debouncing
Prevent excessive event handling:

```javascript
import { debounce } from './utils/dom-helpers.js';

const handleSearch = debounce((query) => {
  performSearch(query);
}, 300);

input.addEventListener('input', (e) => {
  handleSearch(e.target.value);
});
```

---

## Security Considerations

### XSS Prevention
```javascript
import { sanitizeHTML } from './utils/dom-helpers.js';

// Sanitize user input
const safe = sanitizeHTML(userInput);
element.textContent = safe; // Use textContent, not innerHTML
```

### Storage Encryption
```javascript
// Encrypt sensitive data
await storage.set('api_key', encryptData(key), {
  encrypt: true
});
```

### CSP Compliance
Avoid inline scripts and styles:

```javascript
// ❌ Bad
element.innerHTML = '<script>alert("xss")</script>';

// ✅ Good
const script = document.createElement('script');
script.src = 'safe-script.js';
document.head.appendChild(script);
```

---

## Related Documentation

- [Getting Started](GETTING-STARTED.md) - Installation and setup
- [Features](FEATURES.md) - Feature documentation
- [Development](DEVELOPMENT.md) - Development workflow
- [API Guides](API-GUIDES.md) - AI API integration
- [Experiments](EXPERIMENTS.md) - Interactive demos

---

**Last Updated:** October 4, 2025

