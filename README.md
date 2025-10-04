# Browser Agent Extension

A powerful AI assistant available as **both** a Chrome Extension and Web App, featuring an intelligent hybrid AI system that combines Chrome's built-in AI with smart fallback systems for unmatched reliability and performance.

---

## 🚀 Quick Start

### Install as Chrome Extension
1. Open `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" → Select this folder
4. Access via side panel or extension icon

### Run as Web App
```bash
cd browser-agent-extension
python3 -m http.server 8000
# Open http://localhost:8000
```

**Same code, same features, zero duplication!** ✅

---

## ✨ Key Features

### 🤖 Hybrid AI System
- **Primary AI**: Chrome's Gemini Nano (local, fast, private)
- **Smart Fallback**: OpenAI, Anthropic, Google APIs
- **Seamless Switching**: Transparent AI system selection
- **Status Indicators**: Clear visibility of active AI

### 💬 AI Chat Assistant
- Natural language conversation
- Multiple chat sessions
- Markdown support with syntax highlighting
- Streaming responses with stop control

### ✉️ Craft Mail
- AI-powered email composition
- Professional templates
- Tone adjustment (formal, casual, professional)
- One-click copy to Gmail/Outlook

### 🤖 Specialized AI Agents
- **@research**: Web search and information gathering
- **@code**: Code generation and explanation
- **@write**: Content creation and editing
- **@analyze**: Data analysis and insights

### 🚀 Web Developer Agent
- Build websites from natural language
- Live preview in new tabs
- Interactive element editing
- Multiple templates (landing, portfolio, dashboard, e-commerce)

### ⚙️ Advanced Configuration
- Multiple LLM providers (OpenAI, Anthropic, Google, Local)
- Task-specific model selection
- API key management
- Import/export configurations

---

## 📚 Documentation

### Getting Started
- **[Installation & Setup](docs/GETTING-STARTED.md)** - Get up and running in 5 minutes
- **[Features Guide](docs/FEATURES.md)** - Comprehensive feature documentation
- **[Experiments](docs/EXPERIMENTS.md)** - Interactive AI playgrounds and demos

### Development
- **[Architecture](docs/ARCHITECTURE.md)** - System design and architecture
- **[Development Guide](docs/DEVELOPMENT.md)** - Contributing and development workflow
- **[API Integration](docs/API-GUIDES.md)** - AI API setup and usage

---

## 🎯 Use Cases

### For End Users
- 📧 Compose professional emails in seconds
- 💬 Get instant answers to questions
- 🌐 Build websites without coding
- 📝 Generate content for blogs, social media
- 🔍 Research topics with AI assistance

### For Developers
- 💻 Code generation and debugging
- 📖 API documentation and examples
- 🧪 Experiment with Chrome AI APIs
- 🔧 Extend with custom features

---

## 🏗️ Project Structure

```
browser-agent-extension/
├── README.md                 # This file
├── manifest.json            # Extension manifest
├── index.html              # Web app entry point
├── sidepanel.html         # Extension UI
│
├── scripts/               # JavaScript modules
│   ├── core/             # App controller, module loader
│   ├── features/         # Chat, memory, agent, mail, webdev
│   ├── services/         # AI service integration
│   ├── utils/           # Event bus, storage, helpers
│   └── main.js          # Application entry point
│
├── styles/              # CSS files
├── icons/              # Extension icons
├── docs/              # Documentation (see above)
└── experiments/       # AI API playgrounds
```

---

## 🔧 Chrome AI Setup (Optional)

For best performance, enable Chrome's built-in AI:

1. Open `chrome://flags`
2. Enable "Prompt API for Gemini Nano"
3. Enable "optimization guide on device" → "BypassPerfRequirement"
4. Restart Chrome

**Note**: Works without Chrome AI using fallback systems.

---

## 📦 Packaging for Distribution

```bash
cd /path/to/parent/directory
zip -r browser-agent-extension.zip browser-agent-extension/ \
  -x "*.git*" \
  -x "*node_modules*" \
  -x "*.DS_Store"
```

---

## 🚦 Status Indicators

- 🟢 **Green** - Chrome AI Active (local, fast, private)
- 🟠 **Orange** - Fallback API Active
- 🔵 **Blue** - Smart Templates Mode

---

## 📈 Performance

- **Chat Response**: <100ms session switching
- **Email Generation**: <2s with AI, <50ms with templates
- **Memory Usage**: <50MB typical
- **Storage**: <1MB per 100 conversations
- **Website Generation**: 5-15s per complete site

---

## 🔒 Privacy & Security

- ✅ **100% Local Processing** with Chrome AI
- ✅ **No Tracking** - Zero telemetry or analytics
- ✅ **User Control** - Clear data anytime
- ✅ **Secure Storage** - API keys stored locally only
- ✅ **Optional External APIs** - You control what's enabled

---

## 🤝 Contributing

Contributions welcome! Please see [Development Guide](docs/DEVELOPMENT.md) for:
- Setup instructions
- Coding standards
- Testing guidelines
- Pull request process

---

## 🆘 Support

### Quick Links
- 📖 [Full Documentation](docs/)
- 🐛 [Report Issues](https://github.com/your-repo/issues)
- 💡 [Feature Requests](https://github.com/your-repo/discussions)
- ❓ [FAQ](docs/GETTING-STARTED.md#troubleshooting)

### Common Issues
- **Chrome AI not working?** Check [Chrome AI Setup](#-chrome-ai-setup-optional)
- **Extension not loading?** See [Troubleshooting](docs/GETTING-STARTED.md#troubleshooting)
- **Performance issues?** See [Performance Tips](docs/DEVELOPMENT.md#performance-optimization)

---

## 📄 License

MIT License - see LICENSE file for details.

---

## 🌟 Recent Updates

### v2.0 - Modular Architecture
- Refactored to modular design (25+ focused modules)
- Improved maintainability and testability
- Better performance and reliability

### Latest Features
- ✨ Hybrid AI system with smart fallback
- 🌐 Web Developer Agent
- 💬 Specialized AI agents (@research, @code, @write, @analyze)
- ⚙️ Advanced LLM configuration
- 🎨 Modern, responsive UI with UX improvements

---

## 🎯 Roadmap

- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Plugin system
- [ ] Collaborative features
- [ ] Advanced analytics
- [ ] Custom agent creation

---

**Built with ❤️ using Chrome's AI capabilities and modern web technologies**
