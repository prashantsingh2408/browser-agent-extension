# Experiments & Playgrounds

## Overview
The `experiments/` folder contains interactive playgrounds and demos showcasing Chrome's AI capabilities through various use cases.

---

## Experiment Index

### 🎮 Main Playground
**File**: `experiments/index.html`  
**Description**: Comprehensive demo of all AI features with mode selector

**Features:**
- Mode switching (local/api)
- All API demos in one place
- Interactive testing environment

---

## AI API Experiments

### 1. Prompt API Experiments

#### AI Playground
**File**: `prompt-api/ai-playground.html`  
**Purpose**: General-purpose AI interaction

**Features:**
- Open-ended prompts
- Parameter tuning
- Response streaming
- Session management

#### Code Explainer
**File**: `prompt-api/code-explainer.html`  
**Purpose**: Explain code in natural language

**Features:**
- Multi-language support
- Line-by-line breakdown
- Complexity analysis
- Best practices suggestions

#### Content Categorizer
**File**: `prompt-api/content-categorizer.html`  
**Purpose**: Automatically categorize content

**Features:**
- Custom category definition
- Confidence scoring
- Batch processing
- Export results

#### Data Extraction
**File**: `prompt-api/data-extraction.html`  
**Purpose**: Extract structured data from text

**Features:**
- Schema definition
- JSON output
- Validation
- Multiple extraction strategies

#### Page Q&A
**File**: `prompt-api/page-qa.html`  
**Purpose**: Answer questions about web pages

**Features:**
- Content parsing
- Context-aware answers
- Source citation
- Multi-question support

#### Sentiment Analyzer
**File**: `prompt-api/sentiment-analyzer.html`  
**Purpose**: Analyze text sentiment

**Features:**
- Positive/negative/neutral detection
- Confidence scores
- Emotion breakdown
- Batch analysis

---

### 2. Summarizer Experiments

#### Article Summary
**File**: `summarizer/article-summary.html`  
**Purpose**: Summarize long articles

**Features:**
- Key points extraction
- TL;DR generation
- Length control
- Bullet point format

#### Email Digest
**File**: `summarizer/email-digest.html`  
**Purpose**: Create email summaries

**Features:**
- Action items extraction
- Priority detection
- Thread summarization
- Quick reply suggestions

#### Meeting Notes
**File**: `summarizer/meeting-notes.html`  
**Purpose**: Summarize meeting transcripts

**Features:**
- Key decisions extraction
- Action items list
- Participant mentions
- Topic breakdown

#### Review Digest
**File**: `summarizer/review-digest.html`  
**Purpose**: Aggregate product reviews

**Features:**
- Pros/cons extraction
- Rating analysis
- Common themes
- Purchase recommendation

---

### 3. Translator Experiments

#### Webpage Translator
**File**: `translator/webpage-translator.html`  
**Purpose**: Translate entire web pages

**Features:**
- Preserve formatting
- Multiple languages
- Real-time translation
- DOM manipulation

#### Multilingual Chat
**File**: `translator/multilingual-chat.html`  
**Purpose**: Chat in different languages

**Features:**
- Auto language detection
- Real-time translation
- Chat history
- Multiple participants

#### Document Batch Translator
**File**: `translator/document-batch.html`  
**Purpose**: Translate multiple documents

**Features:**
- Bulk processing
- Progress tracking
- Format preservation
- Export options

---

### 4. Writer Experiments

#### Email Composer
**File**: `writer/email-composer.html`  
**Purpose**: Generate professional emails

**Features:**
- Template selection
- Tone adjustment
- Length control
- Recipient personalization

#### Social Media Generator
**File**: `writer/social-media.html`  
**Purpose**: Create social media posts

**Features:**
- Platform-specific formatting
- Hashtag suggestions
- Character limits
- Emoji integration

---

### 5. Rewriter Experiments

#### Tone Adjuster
**File**: `rewriter/tone-adjuster.html`  
**Purpose**: Change text tone

**Features:**
- Multiple tone options
- Before/after comparison
- Preserve meaning
- Style consistency

#### Length Optimizer
**File**: `rewriter/length-optimizer.html`  
**Purpose**: Adjust text length

**Features:**
- Expand or compress
- Maintain key points
- Readability preservation
- Target word count

---

### 6. Proofreader Experiments

#### Real-time Checker
**File**: `proofreader/realtime-checker.html`  
**Purpose**: Live grammar and spelling check

**Features:**
- As-you-type checking
- Inline suggestions
- Error highlighting
- Auto-correction

#### Professional Polish
**File**: `proofreader/professional-polish.html`  
**Purpose**: Enhance writing quality

**Features:**
- Style improvements
- Clarity enhancement
- Professional tone
- Readability optimization

---

### 7. Multimodal Experiments

#### Image Analyzer
**File**: `multimodal/image-analyzer.html`  
**Purpose**: Analyze and describe images

**Features:**
- Object detection
- Scene description
- Text extraction (OCR)
- Image search

#### Audio Transcriber
**File**: `multimodal/audio-transcriber.html`  
**Purpose**: Convert speech to text

**Features:**
- Real-time transcription
- Speaker identification
- Timestamp generation
- Export formats

---

### 8. Language Detector Experiments

#### Smart Input
**File**: `language-detector/smart-input.html`  
**Purpose**: Detect input language

**Features:**
- Auto-detection
- Confidence scoring
- Mixed language support
- Switch keyboard layouts

#### Content Routing
**File**: `language-detector/content-routing.html`  
**Purpose**: Route content by language

**Features:**
- Multi-language content
- Automatic categorization
- Translation triggers
- Analytics

---

### 9. Hybrid AI Experiments

#### Smart Fallback
**File**: `hybrid-ai/smart-fallback.html`  
**Purpose**: Demonstrate fallback system

**Features:**
- Primary/fallback switching
- Status monitoring
- Performance comparison
- Error handling

#### Cost Optimizer
**File**: `hybrid-ai/cost-optimizer.html`  
**Purpose**: Optimize AI API costs

**Features:**
- Model selection
- Usage tracking
- Cost estimation
- Optimization suggestions

---

## Development Documentation

### Quick Reference
**File**: `experiments/QUICK-REFERENCE.md`  
**Content**: Quick API reference for developers

### Troubleshooting
**File**: `experiments/TROUBLESHOOTING.md`  
**Content**: Common issues and solutions

### Implementation Summary
**File**: `experiments/IMPLEMENTATION-SUMMARY.md`  
**Content**: Technical implementation details

---

## Running Experiments

### Local Server
```bash
cd browser-agent-extension
python3 -m http.server 8000
# Navigate to http://localhost:8000/experiments/
```

### VS Code Live Server
1. Install Live Server extension
2. Right-click any HTML file
3. Select "Open with Live Server"

### Direct Browser
Open HTML files directly in Chrome (some features may be limited)

---

## Experiment Structure

Each experiment follows this pattern:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Experiment Name</title>
  <link rel="stylesheet" href="../styles/common.css">
</head>
<body>
  <div class="container">
    <h1>Experiment Title</h1>
    <div class="controls">
      <!-- Input controls -->
    </div>
    <div class="output">
      <!-- Results display -->
    </div>
  </div>
  
  <script>
    // AI API initialization
    // Feature implementation
    // UI updates
  </script>
</body>
</html>
```

---

## Adding New Experiments

### Template
```javascript
// 1. Check API availability
const available = await ai.featureName.capabilities();

// 2. Create session/instance
const instance = await ai.featureName.create(config);

// 3. Process input
const result = await instance.process(input);

// 4. Display results
displayResults(result);

// 5. Handle errors
try {
  // API calls
} catch (error) {
  console.error('Error:', error);
  showFallback();
}
```

### Best Practices
1. Always check API availability first
2. Provide clear error messages
3. Implement graceful fallbacks
4. Add loading indicators
5. Enable result export
6. Include usage instructions
7. Log performance metrics

---

## Testing

### Browser Compatibility
- Chrome Canary: ✅ Full support
- Chrome Dev: ✅ Full support
- Chrome Stable: ⚠️ Limited (experimental flags required)
- Other browsers: ❌ Fallback to external APIs

### Feature Availability
Check `ai.capabilities()` before using any API:

```javascript
async function checkSupport() {
  return {
    languageModel: await ai.languageModel?.capabilities() ?? null,
    summarizer: await ai.summarizer?.capabilities() ?? null,
    translator: await translation?.capabilities() ?? null,
    writer: await ai.writer?.capabilities() ?? null,
    rewriter: await ai.rewriter?.capabilities() ?? null
  };
}
```

---

## Performance Monitoring

### Metrics to Track
- Response time
- Token usage
- API success rate
- Fallback frequency
- User interactions

### Implementation
```javascript
const metrics = {
  startTime: Date.now(),
  endTime: null,
  success: false,
  fallbackUsed: false
};

// Track and log
console.log('Performance:', {
  duration: metrics.endTime - metrics.startTime,
  successRate: calculateSuccessRate(),
  avgResponseTime: calculateAverage()
});
```

---

## Resources

### Official Documentation
- [Chrome AI Documentation](https://developer.chrome.com/docs/ai/built-in)
- [Prompt API Explainer](https://github.com/explainers-by-googlers/prompt-api)
- [Chrome Origin Trials](https://developer.chrome.com/origintrials/)

### Community
- [Chrome AI Discord](https://discord.gg/chrome-ai)
- [Stack Overflow Tag](https://stackoverflow.com/questions/tagged/chrome-ai)
- [GitHub Discussions](https://github.com/GoogleChrome/chrome-ai-discussions)

---

## Contributing

To add new experiments:

1. Create HTML file in appropriate subfolder
2. Follow existing naming convention
3. Include comments and documentation
4. Add entry to this document
5. Test in Chrome Canary/Dev
6. Create pull request

---

## Future Experiments

Planned experiments (contributions welcome):
- [ ] Voice commands
- [ ] Image generation
- [ ] Video analysis
- [ ] Real-time collaboration
- [ ] AR/VR integration
- [ ] Custom model fine-tuning

