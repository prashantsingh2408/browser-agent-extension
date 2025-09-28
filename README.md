# AI Browser Agent Extension

A Chrome extension that provides an AI assistant with quick action buttons for extracting page content. The extension uses Chrome's built-in Gemini Nano AI model for conversations.

## Features

### 🤖 AI Assistant
- **Chat Interface**: Have conversations with the built-in AI assistant
- **Content Analysis**: Share page content with the AI using the quick action buttons
- **Private & Local**: Uses Chrome's on-device Gemini Nano model

### 🚀 Quick Action Buttons
- **Attach Page Content**: One-click to attach the current page's content to your message
- **Attach Selection**: Quickly attach any text you've selected on the page
- **Get Links**: Extract all links from the page with a single click
- **Get Images**: Find all images on the page instantly

### 📋 Available Functions

The agent has access to these powerful functions:

1. **getPageContent** - Extract main content from the current webpage
   - Optional CSS selector for specific content
   - Includes metadata (title, URL, description)

2. **getSelectedText** - Get currently selected text on the page

3. **getPageMetadata** - Extract comprehensive page metadata
   - Title, URL, description, keywords
   - Open Graph data
   - Twitter Card data
   - Schema.org structured data

4. **findElements** - Find elements using CSS selectors
   - Returns element details and positions
   - Optional text extraction

5. **getImages** - Extract all images from the page
   - IMG tags and background images
   - Image metadata (alt text, dimensions)

6. **getLinks** - Extract all links
   - Filter internal/external links
   - Link text and attributes

7. **getVideos** - Find videos on the page
   - HTML5 videos
   - YouTube/Vimeo embeds
   - Video metadata

8. **getForms** - Analyze forms on the page
   - Form fields and attributes
   - Input types and values

9. **clickElement** - Click on page elements
   - Uses CSS selectors
   - Simulates user clicks

10. **fillInput** - Fill form fields
    - Input text into fields
    - Trigger proper events

11. **scrollToElement** - Scroll to specific elements
    - Smooth scrolling option
    - Center element in view

12. **extractTable** - Extract table data
    - Multiple format outputs (JSON, CSV, text)
    - Headers and rows extraction

13. **analyzePageStructure** - Comprehensive page analysis
    - Element counts
    - Semantic structure
    - Accessibility metrics
    - Performance stats

14. **searchInPage** - Search text within the page
    - Case sensitive/insensitive
    - Whole word matching
    - Returns matches with context

## How It Works

### Quick Action Buttons

**Smart Button Features:**
- **Automatic Highlighting**: When you select text on a page, all relevant buttons (Selection, Summarize, Translate, Improve) pulse with a blue highlight
- **Context-Aware**: Buttons automatically detect if text is selected and act accordingly
- **Graceful Fallbacks**: If Chrome's specialized AI APIs aren't available, buttons fallback to using Gemini Nano

**Available Buttons:**

1. **Attach Page** 📄 - Extracts full page content with metadata
2. **Attach Selection** 🔍 - Attaches selected text (highlights when text selected)
3. **Summarize** ⚡ - Summarizes selected text OR full page
4. **Translate** 🌐 - Translates selected text OR page to Spanish  
5. **Improve** ✏️ - Improves selected text clarity and quality

**How They Work:**

1. **Type Your Message** (optional): Start typing in the chat
2. **Select Text** (optional): Highlight text on the page to work with specific content
3. **Click a Button**: The button will use selected text if available, otherwise page content
4. **Content Appends**: For attach buttons, content is added to your message
5. **AI Processes**: For action buttons (Summarize/Translate/Improve), AI processes immediately

### Example Workflow

1. Type: "Can you explain this article about"
2. Click: **Attach Page Content** button
3. Your message becomes:
   ```
   Can you explain this article about

   [Attached Page Content]
   **Page:** Article Title
   **URL:** https://example.com/article
   **Content Preview:** The article content...
   ```
4. Send the message and the AI will analyze the attached content

## Installation

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `browser-agent-extension` directory
5. The extension will be installed and ready to use

## Usage

1. Click the extension icon or press `Alt+Shift+A` to open the side panel
2. Use the quick action buttons at the bottom:
   - **Attach Page Content**: Instantly get the page content ready in your message
   - **Attach Selection**: Select text on the page, then click to attach it
   - **Get Links**: Extract all links from the current page
   - **Get Images**: Find all images on the page
3. Or chat directly with the AI agent:
   - "Can you access this page?"
   - "What's on this website?"
   - "Summarize the current page"
   - "Find all forms on this page"
   - "Extract the main content"
   - "What images are here?"
   - "Search for [term] on this page"

## Technical Details

### Architecture

```
├── manifest.json          # Extension configuration
├── scripts/
│   ├── background.js     # Service worker for message handling
│   ├── content.js        # Content script with all functions
│   ├── sidepanel.js      # Side panel UI and AI integration
│   └── modules/
│       └── functions.js  # Function registry and handling
├── sidepanel.html        # Side panel interface
└── styles/
    └── sidepanel.css     # Styling
```

### Key Components

1. **Content Script** (`content.js`)
   - Implements all page interaction functions
   - Handles function execution requests
   - Provides comprehensive page access

2. **Background Script** (`background.js`)
   - Manages message passing between components
   - Handles screenshot capture
   - Manages tab interactions

3. **Side Panel** (`sidepanel.js`)
   - AI chat interface
   - Function call detection and execution
   - Response formatting and display

4. **Function Module** (`functions.js`)
   - Function registry with metadata
   - Intent detection for page access
   - Function call parsing

### Permissions

The extension requires these permissions:
- `sidePanel` - Display the side panel interface
- `activeTab` - Access the current tab
- `tabs` - Tab management
- `scripting` - Inject and execute scripts
- `storage` - Store preferences
- `<all_urls>` - Access any website

## Privacy & Security

- Uses Chrome's built-in Gemini Nano model (100% local, no data sent to servers)
- All page interactions happen locally in your browser
- No external API calls or data transmission
- Content script only executes when you interact with the agent

## Requirements

- Chrome 138 or later (for Gemini Nano support)
- Gemini Nano must be enabled in Chrome flags:
  1. Navigate to `chrome://flags/`
  2. Search for "optimization-guide-on-device-model"
  3. Set to "Enabled BypassPerfRequirement"
  4. Restart Chrome

## Development

### Adding New Quick Action Buttons

1. Add button HTML in `sidepanel.html` in the quick-actions div
2. Add button styles in `sidepanel.css` if needed
3. Create handler function in `sidepanel.js`:
```javascript
async function handleNewAction() {
  // Get data using window.functionHandler.executeFunction
  const result = await window.functionHandler.executeFunction('functionName', {});
  // Format and append to input
  const attachmentText = `[Attached Data]\n${result}`;
  userInput.value += attachmentText;
}
```
4. Add event listener in `setupEventListeners()` function

## Troubleshooting

### Quick action buttons not working
- Make sure you're not on a restricted page (chrome://, chrome-extension://)
- Refresh the page and try again
- Check if the content script is loaded

### AI model not available
- Ensure Chrome 138+ is installed
- Enable Gemini Nano in chrome://flags/
- Restart Chrome after enabling flags

### Buttons don't extract content
- Open DevTools and check for errors
- Verify you're on a regular webpage
- Try reloading the extension

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## Future Enhancements

- [ ] More quick action buttons (forms, tables, etc.)
- [ ] Visual element selection
- [ ] Export extracted data to files
- [ ] Save chat history
- [ ] Custom button configurations
- [ ] Keyboard shortcuts for buttons
- [ ] Preview extracted content before sending
- [ ] Support for more content types