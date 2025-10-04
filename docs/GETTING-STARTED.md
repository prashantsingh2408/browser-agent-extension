# Getting Started with Browser Agent Extension

## Quick Start (5 Minutes)

### Installation Options

#### Option 1: Chrome Extension (Recommended)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Select the `browser-agent-extension` folder
5. Click the extension icon or open side panel

#### Option 2: Web App (Universal)
```bash
cd browser-agent-extension
python3 -m http.server 8000
# Open http://localhost:8000
```

Or use VS Code Live Server:
- Right-click `index.html` → "Open with Live Server"

### Chrome AI Setup (Optional)
1. Navigate to `chrome://flags`
2. Enable "Prompt API for Gemini Nano"
3. Enable "optimization guide on device" with "BypassPerfRequirement"
4. Restart Chrome

## Core Features

### 1. AI Chat Assistant
- Natural language conversation with AI
- Multiple chat sessions with tabs
- Markdown support with syntax highlighting
- Persistent chat history

### 2. Craft Mail
- AI-powered email composition
- Professional templates
- Grammar and tone adjustment
- One-click copy to email clients

### 3. AI Agent
- Specialized agents: @research, @code, @write, @analyze
- Real-time progress tracking
- Interactive chat interface
- Step-by-step execution visibility

### 4. Web Developer Agent
- Build websites from natural language
- Live preview in new tabs
- Interactive element editing
- Multiple templates (landing pages, portfolios, dashboards)

### 5. Settings & Configuration
- Multiple LLM providers (OpenAI, Anthropic, Google)
- Task-specific model selection
- API key management
- Import/export configurations

## Common Tasks

### Starting a Chat
1. Click the "Chat" tab
2. Type your message
3. Press Enter or click Send
4. View AI response with markdown formatting

### Composing an Email
1. Navigate to "Craft Mail" tab
2. Describe your email needs
3. Review AI-generated content
4. Copy to Gmail/Outlook

### Using AI Agents
1. Go to "AI Agent" tab
2. Type `@research your query` (or @code, @write, @analyze)
3. Watch step-by-step progress
4. View final results

### Building a Website
1. Open "Web Dev Agent" tab
2. Describe your website (e.g., "Create a landing page for a coffee shop")
3. Wait for generation
4. Click "Open in New Tab" to preview
5. Make edits by describing changes

## Troubleshooting

### Chrome AI Not Available
- Ensure Chrome flags are enabled (see setup above)
- Restart Chrome completely
- System will fallback to templates automatically

### Extension Not Loading
- Check Developer mode is enabled
- Verify folder contains `manifest.json`
- Check console for errors (F12)

### Performance Issues
- Clear old chat history (Settings → Clear Data)
- Disable unused features
- Check Chrome memory usage

## Next Steps

- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- **Features**: See [FEATURES.md](FEATURES.md) for detailed feature documentation
- **API Integration**: See [API-GUIDES.md](API-GUIDES.md) for AI API details
- **Development**: See [DEVELOPMENT.md](DEVELOPMENT.md) for codebase information

