# ⚡ Chrome Built-in AI - Quick Reference

## 🚀 1-Minute Setup

```bash
# 1. Enable Flags
chrome://flags/#optimization-guide-on-device-model → Enabled
chrome://flags/#prompt-api-for-gemini-nano → Enabled

# 2. Restart Chrome

# 3. Open Experiments
file:///path/to/experiments/index.html
```

## 📝 API Quick Syntax

### **Translator API** (Stable ✅)

```javascript
// Check availability
const canTranslate = await translation.canTranslate({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

// Create translator
const translator = await translation.createTranslator({
  sourceLanguage: 'en',
  targetLanguage: 'es'
});

// Translate
const result = await translator.translate('Hello world');
// result: "Hola mundo"

translator.destroy();
```

### **Language Detector API** (Stable ✅)

```javascript
// Detect language
const detector = await translation.createDetector();
const results = await detector.detect('Bonjour le monde');

console.log(results);
// [{ detectedLanguage: 'fr', confidence: 0.95 }]

detector.destroy();
```

### **Summarizer API** (Stable ✅)

```javascript
// Check availability
const canSummarize = await ai.summarizer.capabilities();

// Create summarizer
const summarizer = await ai.summarizer.create({
  type: 'key-points',      // or 'tl;dr', 'teaser', 'headline'
  length: 'short',         // or 'medium', 'long'
  format: 'plain-text'     // or 'markdown'
});

// Summarize
const summary = await summarizer.summarize(longText);

summarizer.destroy();
```

### **Writer API** (Origin Trial 🔬)

```javascript
// Create writer
const writer = await ai.writer.create({
  tone: 'formal',          // or 'neutral', 'casual'
  length: 'medium',        // or 'short', 'long'
  format: 'plain-text'     // or 'markdown'
});

// Generate content
const result = await writer.write('Write a professional email requesting a meeting');

writer.destroy();
```

### **Rewriter API** (Origin Trial 🔬)

```javascript
// Create rewriter
const rewriter = await ai.rewriter.create({
  tone: 'more-formal',     // or 'more-casual', 'as-is'
  length: 'as-is',         // or 'shorter', 'longer'
  format: 'plain-text'     // or 'markdown'
});

// Rewrite text
const result = await rewriter.rewrite('hey can u send that file?');
// result: "Could you please send that file?"

rewriter.destroy();
```

### **Prompt API** (Origin Trial 🔬)

```javascript
// Check availability
const capabilities = await ai.languageModel.capabilities();
console.log(capabilities);
// { available: 'readily', defaultTopK: 3, maxTopK: 8, defaultTemperature: 0.8 }

// Create session
const session = await ai.languageModel.create({
  temperature: 0.7,
  topK: 3,
  systemPrompt: 'You are a helpful assistant.'
});

// Single prompt
const response = await session.prompt('Explain recursion');

// Streaming (for long responses)
const stream = await session.promptStreaming('Write a story');
for await (const chunk of stream) {
  console.log(chunk);
}

// Multi-turn conversation
await session.prompt('What is AI?');
await session.prompt('Can you explain that in simpler terms?');

// Clone session (keeps conversation history)
const newSession = await session.clone();

// Cleanup
session.destroy();
```

### **Proofreader API** (Prototype 🧪)

```javascript
// Create proofreader
const proofreader = await ai.proofreader.create();

// Proofread text
const result = await proofreader.proofread('Thsi is an exmaple text with erors.');

console.log(result);
// { correctedText: 'This is an example text with errors.', corrections: [...] }

proofreader.destroy();
```

## 🎯 Common Patterns

### **Pattern: Availability Check**

```javascript
async function checkAIAvailability() {
  const apis = {
    translator: 'translation' in self,
    summarizer: 'ai' in self && 'summarizer' in ai,
    languageModel: 'ai' in self && 'languageModel' in ai,
    writer: 'ai' in self && 'writer' in ai,
    rewriter: 'ai' in self && 'rewriter' in ai,
    proofreader: 'ai' in self && 'proofreader' in ai
  };
  
  return apis;
}
```

### **Pattern: Graceful Fallback**

```javascript
async function summarizeWithFallback(text) {
  try {
    // Try on-device
    if ('ai' in self && 'summarizer' in ai) {
      const summarizer = await ai.summarizer.create();
      const result = await summarizer.summarize(text);
      summarizer.destroy();
      return result;
    }
  } catch (error) {
    console.log('On-device failed, using cloud');
  }
  
  // Fallback to cloud
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  
  return await response.json();
}
```

### **Pattern: Session Management**

```javascript
class AISessionManager {
  constructor() {
    this.sessions = new Map();
  }

  async getSession(type, options = {}) {
    if (this.sessions.has(type)) {
      return this.sessions.get(type);
    }

    let session;
    switch (type) {
      case 'chat':
        session = await ai.languageModel.create(options);
        break;
      case 'summarizer':
        session = await ai.summarizer.create(options);
        break;
      // ... other types
    }

    this.sessions.set(type, session);
    return session;
  }

  destroySession(type) {
    if (this.sessions.has(type)) {
      this.sessions.get(type).destroy();
      this.sessions.delete(type);
    }
  }

  destroyAll() {
    for (const [type, session] of this.sessions) {
      session.destroy();
    }
    this.sessions.clear();
  }
}

// Usage
const manager = new AISessionManager();
const session = await manager.getSession('chat', { temperature: 0.7 });
```

## 🚨 Common Errors & Solutions

### **Error: "ai is not defined"**

```javascript
// ❌ Wrong
const result = await ai.summarizer.create();

// ✅ Correct - Always check first
if ('ai' in self && 'summarizer' in ai) {
  const result = await ai.summarizer.create();
} else {
  console.error('Summarizer API not available');
}
```

### **Error: "Model not available"**

```javascript
// Check capabilities first
const capabilities = await ai.summarizer.capabilities();

if (capabilities.available === 'no') {
  alert('Summarizer not available on this device');
} else if (capabilities.available === 'after-download') {
  alert('Model will download on first use...');
  // Proceed - download will start automatically
}
```

### **Error: "Session creation failed"**

```javascript
// Check storage and GPU
try {
  const session = await ai.languageModel.create();
} catch (error) {
  if (error.message.includes('storage')) {
    alert('Need 22GB free space');
  } else if (error.message.includes('gpu')) {
    alert('Need 4GB+ VRAM');
  }
}
```

## 📊 Performance Tips

### **Tip 1: Reuse Sessions**

```javascript
// ❌ Slow - Creates new session each time
async function summarizeMany(texts) {
  for (const text of texts) {
    const summarizer = await ai.summarizer.create();
    await summarizer.summarize(text);
    summarizer.destroy();
  }
}

// ✅ Fast - Reuses session
async function summarizeMany(texts) {
  const summarizer = await ai.summarizer.create();
  for (const text of texts) {
    await summarizer.summarize(text);
  }
  summarizer.destroy();
}
```

### **Tip 2: Use Streaming for Long Responses**

```javascript
// ❌ Slow - Waits for complete response
const response = await session.prompt(longPrompt);
displayResult(response);

// ✅ Fast - Shows results as they arrive
const stream = await session.promptStreaming(longPrompt);
for await (const chunk of stream) {
  appendResult(chunk);
}
```

### **Tip 3: Adjust Temperature for Speed**

```javascript
// Lower temperature = faster & more deterministic
const fastSession = await ai.languageModel.create({
  temperature: 0.3,  // Fast, focused
  topK: 1            // Most likely token
});

// Higher temperature = slower & more creative
const creativeSession = await ai.languageModel.create({
  temperature: 0.9,  // Slow, creative
  topK: 5            // More variety
});
```

## 💰 Cost Calculations

### **Translation**

```javascript
// Cloud (Google Translate API)
// $20 per 1M characters

// Built-in AI
// $0 per query ✅

// Savings on 1M translations (avg 50 chars):
// Cloud: $20 × 50 = $1,000
// Built-in: $0
// Savings: $1,000 per 1M translations
```

### **Summarization**

```javascript
// Cloud (Vertex AI)
// $4-$8 per 1,000 queries

// Built-in AI
// $0 per query ✅

// Savings on 1M summaries:
// Cloud: $4,000-$8,000
// Built-in: $0
// Savings: $4,000-$8,000 per 1M summaries
```

## 🔗 Links

- **Experiments Hub**: `experiments/index.html`
- **Full Documentation**: `EXPERIMENTS-OVERVIEW.md`
- **API Status**: `docs/AI-APIS-STATUS.md`
- **Chrome AI Docs**: https://developer.chrome.com/docs/ai/built-in

## ⚡ TL;DR

```javascript
// 1. Check
if ('ai' in self && 'summarizer' in ai) {
  
  // 2. Create
  const summarizer = await ai.summarizer.create();
  
  // 3. Use
  const summary = await summarizer.summarize(text);
  
  // 4. Cleanup
  summarizer.destroy();
}
```

**That's it!** 🎉 Now go build something amazing!

