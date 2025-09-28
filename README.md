# 🤖 AI Assistant Chrome Extension

A professional Chrome extension that provides an AI-powered assistant using Chrome's built-in Gemini Nano model. Features contextual web page interactions, completely private on-device processing, and a polished user interface.

## ✨ Key Features

### 🎯 Core Capabilities
- **100% Private** - All AI processing happens on-device using Chrome's Gemini Nano
- **No API Keys Required** - Works out of the box with Chrome's built-in AI
- **Professional UI** - Clean, modern interface with smooth animations
- **Context-Aware** - Understands and interacts with current webpage content

### 🔥 Smart Actions
- **📄 Summarize Page** - Get instant summaries of any webpage
- **💡 Explain Selection** - Select any text and get clear explanations
- **🎥 Explain Videos** - Find and explain videos on the current page
- **💬 General Chat** - Ask any questions and get AI-powered answers

### 🎨 User Experience
- **Side Panel Interface** - Non-intrusive sidebar that doesn't block content
- **Welcome Screen** - Helpful suggestions to get started
- **Status Indicators** - Real-time connection and processing status
- **Keyboard Shortcut** - Quick access with `Alt+Shift+A`
- **Clear Chat** - Reset conversations anytime
- **Auto-resize Input** - Text area grows as you type
- **Markdown Support** - Rich text formatting in responses

## 📦 Installation

### Prerequisites
- Chrome version 138 or higher
- Chrome AI features enabled

### Step 1: Enable Chrome AI
1. Navigate to `chrome://flags/`
2. Search for **"Optimization Guide On Device"**
3. Set to **Enabled**
4. Click **Relaunch** to restart Chrome

### Step 2: Load the Extension
1. Open Chrome Extensions: `chrome://extensions/`
2. Enable **Developer Mode** (toggle in top-right)
3. Click **Load unpacked**
4. Select this folder: `/home/neosoft/test/browser-agent-extension`

### Step 3: Pin the Extension
1. Click the puzzle piece icon in Chrome toolbar
2. Find **AI Assistant**
3. Click the pin icon to keep it visible

## 🎯 Usage Guide

### Opening the Assistant
- **Method 1:** Click the extension icon in toolbar
- **Method 2:** Press `Alt+Shift+A` keyboard shortcut
- The assistant opens in a side panel

### Using Smart Actions

#### 📄 Summarize This Page
1. Navigate to any article or webpage
2. Open the assistant
3. Click **"Summarize this page"**
4. Get a structured summary with key points

#### 💡 Explain Selected Text
1. Select any text on a webpage
2. Open the assistant
3. Click **"Explain selected text"**
4. Receive a clear explanation

#### 🎥 Explain Intro Video
1. Visit a page with video content
2. Open the assistant
3. Click **"Explain intro video"**
4. Get insights about the video content

#### 💬 General Questions
1. Type any question in the input field
2. Press Enter or click Send
3. Get AI-powered responses

## 🏗️ Project Structure

```
browser-agent-extension/
├── manifest.json           # Extension configuration
├── sidepanel.html         # Main UI structure
├── README.md              # Documentation (this file)
│
├── scripts/
│   ├── sidepanel.js       # Main application logic
│   ├── content.js         # Page interaction & content extraction
│   └── background.js      # Extension setup & lifecycle
│
├── styles/
│   └── sidepanel.css      # Professional UI styling
│
└── icons/                 # Extension icons (16, 32, 48, 128px)
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```

## 🔧 Technical Architecture

### Core Components

#### 1. **sidepanel.js** (461 lines)
Main application logic handling:
- AI session management with Gemini Nano
- Message processing and chat interface
- Action chip handlers for smart features
- Status management and error handling
- Markdown formatting for responses

Key Functions:
- `initializeAI()` - Checks and initializes Chrome's LanguageModel API
- `createAISession()` - Creates persistent AI session with Gemini Nano
- `handleActionChip()` - Dispatches smart action requests
- `summarizePage()` - Extracts and summarizes webpage content
- `explainSelection()` - Explains user-selected text
- `explainVideo()` - Analyzes video content on page

#### 2. **content.js** (78 lines)
Page interaction layer providing:
- Content extraction from webpages
- Text selection detection
- Video discovery on pages
- Clean text processing

Key Functions:
- `getPageContent()` - Intelligent content extraction
- `findVideosOnPage()` - Detects HTML5 and YouTube videos
- `cleanText()` - Text sanitization and truncation

#### 3. **background.js** (29 lines)
Extension lifecycle management:
- Side panel configuration
- Icon click handling
- Keyboard shortcut registration

### AI Integration

The extension uses Chrome's built-in **Gemini Nano** model through the `LanguageModel` API:

```javascript
// AI Configuration
const aiSession = await LanguageModel.create({
  temperature: 0.7,      // Balanced creativity
  topK: 3,              // Focused responses
  language: 'en',       // English output
  systemPrompt: 'You are a helpful, friendly, and knowledgeable AI assistant.'
});
```

### Data Flow
1. User triggers action (click/type/select)
2. Content script extracts page data if needed
3. Sidepanel processes request with AI
4. Gemini Nano generates response
5. UI updates with formatted result

## 🎨 UI/UX Features

### Design System
- **Color Palette**: Google Material Design colors
- **Typography**: System fonts with fallbacks
- **Spacing**: Consistent 4px grid system
- **Animations**: Smooth transitions (300ms ease)
- **Icons**: Circular blue design with transparency

### Responsive Elements
- Message bubbles with avatars
- Loading animation with bouncing dots
- Status indicator with pulse animation
- Auto-scrolling chat container
- Input field that grows with content

## 🔒 Privacy & Security

### Data Protection
- **No External Servers** - Everything runs locally
- **No API Calls** - No internet requests for AI
- **No Data Collection** - Zero analytics or tracking
- **No Storage** - Conversations aren't saved
- **Session Only** - Data cleared on close

### Permissions Used
- `sidePanel` - Display UI in browser sidebar
- `activeTab` - Read current page content
- `tabs` - Access page title and URL

## 🐛 Troubleshooting

### Common Issues

#### "AI Offline" Status
**Solution:**
1. Ensure Chrome AI is enabled in `chrome://flags/`
2. Restart Chrome completely
3. Check Chrome version (138+ required)

#### "Model Downloading..." Message
**Solution:**
- Wait 1-2 minutes for first-time download (~50MB)
- Ensure stable internet connection
- Model downloads automatically once

#### Extension Not Loading
**Solution:**
1. Check all files are present (see structure above)
2. Verify no syntax errors in console
3. Reload extension in `chrome://extensions/`

#### Content Not Extracted
**Solution:**
- Some dynamic sites may not work perfectly
- Try refreshing the page
- Ensure content script has loaded

## 🚀 Advanced Features

### Markdown Support
The assistant supports markdown formatting:
- **Bold text** with `**text**`
- *Italic text* with `*text*`
- `Code blocks` with backticks
- Headers with `#`, `##`, `###`
- Lists with `*` or `-`

### Keyboard Shortcuts
- `Alt+Shift+A` - Open assistant
- `Enter` - Send message
- `Shift+Enter` - New line in input

## 📊 Performance

- **Model Size**: ~50MB (one-time download)
- **Response Time**: 1-3 seconds typical
- **Memory Usage**: ~30-50MB active
- **CPU Usage**: Minimal when idle

## 🔄 Updates & Maintenance

### How to Update
1. Pull latest changes
2. Reload extension in `chrome://extensions/`
3. No data migration needed

### Browser Compatibility
- Chrome 138+ (required)
- Edge 138+ (Chromium-based)
- Other Chromium browsers (experimental)

## 📄 License

MIT License - Free for personal and commercial use

## 🤝 Contributing

Contributions welcome! The extension is designed to be:
- Easy to extend with new actions
- Simple to customize UI/UX
- Modular for feature additions

## 🙏 Credits

Built with:
- Chrome's Gemini Nano AI
- Chrome Extension Manifest V3
- Google Material Design principles
- Pure JavaScript (no frameworks)

---

**Made with ❤️ using Chrome's on-device AI**

*For questions or issues, check the console for detailed error messages and ensure Chrome AI features are properly enabled.*
