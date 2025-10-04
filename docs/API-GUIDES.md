# AI API Integration Guide

## Overview
This document covers all AI API integrations, including Chrome's built-in APIs, Prompt API features, and legacy API support.

---

## Chrome AI APIs

### Prompt API (Gemini Nano)
Chrome's built-in AI model for local processing.

#### Setup
1. Navigate to `chrome://flags`
2. Enable "Prompt API for Gemini Nano"
3. Enable "optimization guide on device" → "BypassPerfRequirement"
4. Restart Chrome

#### Usage
```javascript
// Check availability
const available = await ai.languageModel.capabilities();

// Create session
const session = await ai.languageModel.create({
  temperature: 0.7,
  topK: 3
});

// Generate response
const response = await session.prompt("Your prompt here");

// Stream response
const stream = await session.promptStreaming("Your prompt here");
for await (const chunk of stream) {
  console.log(chunk);
}
```

#### Features
- ✅ Local processing (no network)
- ✅ Fast response times
- ✅ Full privacy
- ✅ Streaming support
- ✅ Session management
- ⚠️ Requires Chrome Canary/Dev
- ⚠️ Limited model capabilities

---

## Prompt API Features

### 1. Summarization
```javascript
// Create summarizer
const summarizer = await ai.summarizer.create({
  type: 'key-points',
  length: 'medium'
});

// Summarize text
const summary = await summarizer.summarize(longText);
```

**Types:**
- `key-points`: Extract main points
- `tl;dr`: Short summary
- `teaser`: Preview text

**Lengths:**
- `short`: ~100 words
- `medium`: ~300 words
- `long`: ~500 words

### 2. Translation
```javascript
// Create translator
const translator = await translation.createTranslator({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

// Translate text
const translated = await translator.translate("Hello, world!");
```

**Supported Languages:**
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- And 50+ more

### 3. Language Detection
```javascript
// Detect language
const detector = await translation.createDetector();
const results = await detector.detect("Bonjour le monde");
// Returns: [{ language: 'fr', confidence: 0.95 }]
```

### 4. Writer API
```javascript
// Create writer
const writer = await ai.writer.create({
  tone: 'professional',
  format: 'email'
});

// Generate content
const content = await writer.write("Write an email about project update");
```

**Tones:**
- `formal`
- `casual`
- `professional`
- `friendly`

**Formats:**
- `email`
- `blog-post`
- `social-media`
- `documentation`

### 5. Rewriter API
```javascript
// Create rewriter
const rewriter = await ai.rewriter.create({
  tone: 'casual',
  length: 'shorter'
});

// Rewrite text
const rewritten = await rewriter.rewrite(originalText);
```

**Length Options:**
- `shorter`: Reduce length
- `longer`: Expand content
- `same`: Maintain length

---

## Fallback System

### Multi-tier Fallback
Automatic fallback when primary AI is unavailable:

1. **Tier 1**: Chrome Prompt API (Gemini Nano)
2. **Tier 2**: Configured external APIs (OpenAI, Anthropic)
3. **Tier 3**: Smart templates and heuristics

### Implementation
```javascript
async function generateWithFallback(prompt) {
  try {
    // Try Chrome AI
    return await chromeAI.generate(prompt);
  } catch (e1) {
    try {
      // Try external API
      return await externalAPI.generate(prompt);
    } catch (e2) {
      // Use templates
      return await templates.generate(prompt);
    }
  }
}
```

### Status Indicators
- 🟢 **Green**: Primary AI active
- 🟠 **Orange**: Fallback active
- 🔵 **Blue**: Template mode

---

## External API Integration

### OpenAI
```javascript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }]
  })
});
```

**Supported Models:**
- GPT-3.5 Turbo
- GPT-4
- GPT-4 Turbo
- GPT-4 Vision

### Anthropic Claude
```javascript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'claude-3-opus-20240229',
    messages: [{ role: 'user', content: prompt }]
  })
});
```

**Supported Models:**
- Claude 3 Opus
- Claude 3 Sonnet
- Claude 3 Haiku

### Google Gemini
```javascript
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  }
);
```

**Supported Models:**
- Gemini Pro
- Gemini Pro Vision
- Gemini Ultra (coming soon)

---

## API Configuration

### Settings Storage
```javascript
const config = {
  provider: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-4',
  temperature: 0.7,
  maxTokens: 2000,
  enableFallback: true
};

await chrome.storage.local.set({ aiConfig: config });
```

### Model Selection
Different models for different features:

```javascript
const modelConfig = {
  chat: 'gpt-4',
  email: 'gpt-3.5-turbo',
  code: 'gpt-4',
  webdev: 'gpt-4-turbo'
};
```

---

## Testing & Debugging

### API Status Check
```javascript
async function checkAPIStatus() {
  const status = {
    chromeAI: await testChromeAI(),
    openai: await testOpenAI(),
    anthropic: await testAnthropic(),
    google: await testGoogle()
  };
  
  console.log('📊 AI System Status:', status);
  return status;
}
```

### Console Logging
Enable detailed logging:
```javascript
window.AI_DEBUG = true; // Enable debug mode
```

Output example:
```
📊 AI System Status Report:
✅ Available: Chrome Language Model, Writer API
🎯 Primary: Chrome Language Model
❌ Failed: Gemini Nano (not available)
```

### Test Files
- `test-ai-apis.html`: Test all AI APIs
- `test-chrome-official-api.html`: Test Chrome official APIs
- `test-legacy-ai.html`: Test legacy implementations
- `demo-prompt-api-features.html`: Interactive Prompt API demo

---

## Use Cases

### Email Composition
Best model: GPT-3.5 Turbo or Chrome Writer API
- Fast generation
- Professional tone
- Template support

### Code Generation
Best model: GPT-4 or Claude 3 Opus
- Complex logic understanding
- Multiple language support
- Best practices adherence

### Web Development
Best model: GPT-4 Turbo
- Large context window
- HTML/CSS/JS generation
- Responsive design patterns

### Research & Analysis
Best model: Claude 3 Opus
- Large context handling
- Detailed analysis
- Source citation

---

## Performance Optimization

### Caching
```javascript
const cache = new Map();

async function generateWithCache(prompt) {
  if (cache.has(prompt)) {
    return cache.get(prompt);
  }
  
  const response = await generate(prompt);
  cache.set(prompt, response);
  return response;
}
```

### Request Batching
```javascript
const queue = [];
const BATCH_SIZE = 5;

async function batchGenerate(prompts) {
  const batches = chunkArray(prompts, BATCH_SIZE);
  return Promise.all(
    batches.map(batch => 
      Promise.all(batch.map(prompt => generate(prompt)))
    )
  );
}
```

---

## Error Handling

### Common Errors

#### API Key Invalid
```javascript
if (error.status === 401) {
  console.error('Invalid API key. Please check settings.');
  showNotification('API key error', 'error');
}
```

#### Rate Limit
```javascript
if (error.status === 429) {
  const retryAfter = error.headers.get('Retry-After');
  await sleep(retryAfter * 1000);
  return retry();
}
```

#### Model Not Available
```javascript
if (error.message.includes('not available')) {
  console.log('Falling back to alternative model');
  return generateWithFallback(prompt);
}
```

---

## Best Practices

1. **Always implement fallbacks**: Don't rely on single API
2. **Cache responses**: Reduce API calls and costs
3. **Monitor usage**: Track API calls and costs
4. **Handle errors gracefully**: Provide clear user feedback
5. **Test thoroughly**: Use provided test files
6. **Respect rate limits**: Implement backoff strategies
7. **Secure API keys**: Never expose in client-side code
8. **Use streaming**: For better UX on long responses

---

## API Comparison

| Feature | Chrome AI | OpenAI | Anthropic | Google |
|---------|-----------|---------|-----------|---------|
| **Speed** | ⚡ Fastest | 🚀 Fast | 🚀 Fast | 🚀 Fast |
| **Privacy** | 🔒 100% Local | ☁️ Cloud | ☁️ Cloud | ☁️ Cloud |
| **Cost** | ✅ Free | 💰 Paid | 💰 Paid | 💰 Paid |
| **Capabilities** | ⚠️ Limited | ⭐ Advanced | ⭐ Advanced | ⭐ Advanced |
| **Availability** | ⚠️ Chrome only | ✅ Universal | ✅ Universal | ✅ Universal |
| **Context Size** | ~4K tokens | ~128K tokens | ~200K tokens | ~32K tokens |

---

## Troubleshooting

### Chrome AI Not Working
1. Check Chrome version (Canary/Dev required)
2. Verify flags are enabled
3. Restart Chrome completely
4. Check console for errors

### External API Failures
1. Verify API key is valid
2. Check internet connection
3. Confirm API endpoint is correct
4. Review rate limits

### Slow Performance
1. Enable caching
2. Use streaming for long responses
3. Reduce max token limits
4. Consider model downgrade

---

## Resources

- [Chrome AI Origin Trial](https://developer.chrome.com/docs/ai/built-in)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [Anthropic API Docs](https://docs.anthropic.com)
- [Google AI Studio](https://ai.google.dev)

