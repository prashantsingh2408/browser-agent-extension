# AI Browser Agent Extension

A powerful Chrome extension featuring AI-powered chat and email composition with Chrome's built-in AI (Gemini Nano) and smart fallback systems.

## 🌟 Key Features

### 1. **AI Chat Assistant**
- Full-featured chat interface with Gemini Nano integration
- Multiple chat sessions with tab management
- Rich markdown support with syntax highlighting
- Chat history persistence and search

### 2. **Craft Mail** ✨ NEW!
- AI-powered email composition
- Multi-tier API fallback system (Chrome AI → Smart Templates)
- Professional email templates
- Grammar fixing and tone adjustment
- One-click copy to Gmail/Outlook

## 📚 Documentation

### Core Features
- [Chat Features](CHATBOT_FEATURES.md) - Complete chatbot functionality
- [UX Laws Implementation](docs/UX-LAWS-IMPLEMENTATION.md) - Applied UX principles
- [AI APIs Status](docs/AI-APIS-STATUS.md) - Chrome AI integration details

### Design Documentation
- [UI Review](docs/UI-REVIEW.md) - Interface assessment
- [UX Improvements](docs/UX-IMPROVEMENTS.md) - Enhancement details

## 📂 Project Structure

```
browser-agent-extension/
├── README.md                    # This file
├── CHATBOT_FEATURES.md         # Chat features documentation
├── manifest.json               # Extension manifest
├── sidepanel.html             # Main UI HTML
├── docs/                      # Documentation folder
│   ├── AI-APIS-STATUS.md     # AI APIs documentation
│   ├── UI-REVIEW.md          # UI review
│   ├── UX-IMPROVEMENTS.md    # UX enhancements
│   └── UX-LAWS-IMPLEMENTATION.md # Laws of UX applied
├── scripts/                   # JavaScript files
│   ├── sidepanel.js          # Main sidepanel logic
│   ├── mail-compose.js       # Email composition logic
│   ├── ai-apis.js            # AI API integration
│   ├── content.js            # Content script
│   └── functions.js          # Utility functions
├── styles/                    # CSS files
│   └── sidepanel.css         # All styles (2694 lines)
└── icons/                     # Extension icons
```

## 🚀 Recent Updates

### Craft Mail Feature (NEW)
- **Smart Email Generation**: AI-powered email creation from descriptions
- **Multi-tier Fallback**: Chrome AI → Gemini Nano → Smart Templates
- **UX Laws Applied**: 21 UX principles from lawsofux.com
- **Compact UI**: No-scroll interface design
- **Transparent Status**: Shows which AI is active and why

### Chat Enhancements
- **Timer Display**: Real-time processing timer
- **Streaming Output**: Word-by-word text generation
- **Stop Functionality**: Cancel generation mid-stream
- **Multiple Sessions**: Tab-based chat management
- **Rich Formatting**: Full markdown with code highlighting

## 🔧 Installation

### Development Setup
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the `browser-agent-extension` folder
4. The extension will appear in your extensions list

### Chrome AI Setup (Optional but Recommended)
1. Open `chrome://flags`
2. Search for "optimization guide on device"
3. Set to "Enabled BypassPerfRequirement"
4. Search for "gemini nano"
5. Enable "Prompt API for Gemini Nano"
6. Restart Chrome

## 📦 Packaging for Chrome Web Store

```bash
# Navigate to the parent directory
cd /home/neosoft/test

# Create zip file excluding unnecessary files
zip -r browser-agent-extension.zip browser-agent-extension/ \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store" \
  -x "*__pycache__*" \
  -x "*.pyc"
```

## 🚦 Status Indicators

### API Status Colors
- 🟢 **Green** - Chrome AI Active
- 🔵 **Blue** - Smart Templates Mode  
- 🟠 **Orange** - Fallback Active

### Console Status Report
Open DevTools to see detailed API status:
```
📊 AI System Status Report:
✅ Available APIs: Chrome Language Model, Writer API
🎯 Primary API: Chrome Language Model
❌ Failed APIs: Gemini Nano (not available)
```

## 📈 Performance

- **Chat Response**: <100ms session switching
- **Email Generation**: <2s with AI, <50ms with templates
- **Memory Usage**: <50MB typical
- **Storage**: <1MB per 100 conversations

## 🔒 Privacy

- **100% Local**: All AI processing on-device
- **No Tracking**: Zero telemetry or analytics
- **No External APIs**: Everything runs locally
- **User Control**: Clear data anytime

## 📝 Documentation Index

### Quick Links
- [Complete Project Summary](docs/PROJECT-SUMMARY.md) - Full technical details
- [Chat Features](CHATBOT_FEATURES.md) - Chat functionality
- [UX Laws Applied](docs/UX-LAWS-IMPLEMENTATION.md) - Design principles
- [AI APIs Status](docs/AI-APIS-STATUS.md) - API implementation

## 🤝 Contributing

Contributions are welcome! Please ensure:
- No linter errors
- Documentation updated
- Tests pass (if applicable)
- Follow existing code style

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.
