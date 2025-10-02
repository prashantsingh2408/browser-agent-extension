# Web Content Capture & Learning Memory

## Overview

The Memory Agent now includes comprehensive web content capture capabilities inspired by [Orma](https://devpost.com/software/orma), transforming how you save and learn from web content. This system automatically detects learning opportunities and provides intelligent capture tools.

## Features

### 🌐 Web Content Capture

**Automatic Text Selection**
- Select any text on a webpage
- Popup appears for meaningful selections (>10 characters)
- Saves with context (URL, page title, timestamp)
- **Shortcut**: Select text + click popup

**YouTube Video Capture**
- Save video moments with timestamps
- Capture current position or specific segments
- AI-generated captions and descriptions
- **Shortcuts**: 
  - `💾` button in YouTube player
  - `Ctrl+Shift+S` for segments

**Prompt Capture**
- Detect AI chat interfaces (ChatGPT, Claude, Bard, Copilot)
- Save prompts for reuse across different AI tools
- Floating capture button on AI sites
- **Shortcut**: `Ctrl+Shift+P`

**Page Content Capture**
- Extract main content from articles and tutorials
- Smart content detection for learning materials
- **Shortcut**: `Ctrl+Shift+C`

### 🎓 Learning Memory System

**Auto-Detection**
- Automatically detects learning content on:
  - Tutorial sites (YouTube, Khan Academy, Coursera)
  - Documentation (MDN, W3Schools, GitHub)
  - Educational platforms (Medium, Dev.to, Stack Overflow)
- Shows learning capture prompts
- **Shortcut**: `Ctrl+Shift+L`

**Smart Learning Capture**
- **Text Selection**: Save learning notes with context
- **Video Learning**: YouTube moments with personal notes (`Ctrl+Shift+Y`)
- **Code Snippets**: Hover over code blocks to save with language detection
- **Full Page**: Complete learning pages with topic extraction
- **AI Integration**: Chat with your learning memories

**Learning Analytics**
- Track learning memories, topics, and time
- Learning streaks and progress
- Recent learning activity
- Topic-based organization

## Content Types Supported

### Text Content
- **Web Selections**: Selected text with source context
- **Learning Notes**: Curated learning content
- **Prompts**: AI prompts for reuse
- **Articles**: Full page content extraction

### Media Content
- **YouTube Videos**: Timestamped video captures
- **Video Segments**: Specific learning moments
- **Screenshots**: Visual captures with AI captions
- **Code Snippets**: Programming code with syntax highlighting

### Learning Data
- **Content Type**: Article, Video, Code, Documentation, Course
- **Category**: Research, Tutorial, Reference, Inspiration, Project
- **Topics**: Automatically extracted subject tags
- **Reading Time**: Estimated learning duration
- **Difficulty**: Beginner, Intermediate, Advanced
- **Source**: Domain and URL tracking

## How It Works

### 1. Content Detection
```javascript
// Detects learning-relevant pages
function isLearningContent(url, title) {
  const learningIndicators = [
    'tutorial', 'learn', 'course', 'documentation', 'guide',
    'stackoverflow', 'github', 'medium', 'youtube', 'coursera'
  ];
  return learningIndicators.some(indicator => 
    url.includes(indicator) || title.includes(indicator)
  );
}
```

### 2. Smart Capture
- **Text Selection**: Monitors `mouseup` and `keyup` events
- **YouTube Integration**: Injects capture buttons into player
- **AI Site Detection**: Recognizes chat interfaces
- **Code Block Detection**: Finds `<pre>`, `<code>` elements

### 3. Data Storage
```javascript
const learningMemory = {
  id: 'learning_' + timestamp,
  title: 'Learning content title',
  content: 'Captured content',
  category: 'learning',
  type: 'learning_note',
  learningData: {
    contentType: 'Article',
    category: 'tutorial',
    topics: ['javascript', 'web development'],
    readingTime: 5,
    difficulty: 'intermediate'
  }
};
```

## User Interface

### Learning Memory Tab
- **Smart Learning Capture**: 6 feature cards with shortcuts
- **Your Learning Journey**: Statistics and progress tracking
- **Recent Learning**: Latest captured learning content

### Web Capture Notifications
- **Success Notifications**: Confirm successful captures
- **Learning Prompts**: Contextual capture suggestions
- **Progress Feedback**: Real-time capture status

## Integration with Memory Agent

### Unified Storage
- All web content integrates with existing memory system
- Searchable through semantic search
- Available in Memory Chat for AI interactions
- Appears in Memory Insights for pattern analysis

### AI Enhancement
- **Smart Captions**: AI-generated descriptions for captures
- **Topic Extraction**: Automatic subject identification
- **Content Analysis**: Reading time and difficulty assessment
- **Learning Insights**: Pattern recognition in learning habits

## Browser Compatibility

### Chrome Extension
- Full feature support with Chrome APIs
- Background script handles cross-tab communication
- Content scripts inject on all websites
- Persistent storage with `chrome.storage.local`

### Web Application
- Polyfilled Chrome APIs for web compatibility
- LocalStorage fallback for data persistence
- Limited screenshot functionality (requires html2canvas)
- Same UI and functionality as extension

## Privacy & Security

### Local-First Approach
- All data stored locally (Chrome storage or localStorage)
- No cloud synchronization by default
- AI processing uses local Chrome AI APIs when available
- Source URLs and content remain private

### Data Structure
```javascript
{
  memories: {
    'web_123': { /* web selection */ },
    'youtube_456': { /* video capture */ },
    'prompt_789': { /* AI prompt */ },
    'learning_101': { /* learning content */ }
  }
}
```

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl+Shift+L` | Capture learning page | Any webpage |
| `Ctrl+Shift+P` | Capture AI prompt | AI chat sites |
| `Ctrl+Shift+Y` | YouTube learning moment | YouTube |
| `Ctrl+Shift+S` | YouTube segment | YouTube |
| `Ctrl+Shift+C` | Page content | Any webpage |

## Future Enhancements

### Planned Features
- **Cross-browser Support**: Firefox, Safari, Edge
- **Mobile Companion**: QR code sharing to mobile
- **Learning Paths**: Structured learning journeys
- **Collaborative Learning**: Shared learning spaces
- **Advanced Analytics**: Learning pattern insights
- **Export Options**: PDF, Markdown, Notion integration

### AI Improvements
- **Better Topic Extraction**: NLP-based subject identification
- **Learning Recommendations**: Suggest related content
- **Knowledge Gaps**: Identify areas for improvement
- **Spaced Repetition**: Optimal review scheduling

## Technical Implementation

### File Structure
```
scripts/
├── web-capture.js      # Core web capture functionality
├── learning-memory.js  # Learning-specific features
├── memory.js          # Integration with memory system
└── background.js      # Extension background script

manifest.json          # Extension permissions and content scripts
```

### Key Functions
- `initializeWebCapture()`: Setup capture listeners
- `initializeLearningMemory()`: Learning system initialization
- `captureSelectedText()`: Text selection handler
- `captureYouTubeLearningMoment()`: Video learning capture
- `saveLearningMemory()`: Store learning content
- `updateLearningStats()`: Refresh learning analytics

This comprehensive web content capture system transforms the Memory Agent into a powerful learning companion, automatically capturing and organizing your digital learning journey while maintaining complete privacy and local control.
