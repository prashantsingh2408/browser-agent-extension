# 🎯 Prompt API Use Cases in Browser Extension

## Current Implementation

### ✅ Already Working Features

#### 1. **Chat Assistant** (`scripts/sidepanel.js`)
```javascript
// User conversations with AI
const response = await processMessage(userMessage);
```
**Use Cases:**
- General Q&A
- Page content questions
- Code help
- Writing assistance

#### 2. **Email Generator** (`scripts/mail-compose.js`)
```javascript
const session = await window.ai.languageModel.create({
  systemPrompt: 'Professional email assistant'
});
const email = await session.prompt(emailRequest);
```
**Use Cases:**
- Business emails
- Reply emails
- Meeting invitations
- Follow-ups

#### 3. **Memory Agent** (`scripts/memory.js`)
```javascript
// Generate narratives
const narrative = await session.prompt(generateEmpathyPrompt(memory));

// Search memories
const answer = await getMemoryAnswer(question);
```
**Use Cases:**
- Photo captions
- Life event narratives
- Memory search
- Personal knowledge base

#### 4. **Hybrid Agent** (`scripts/agent.js`)
```javascript
const result = await generateAgentResponse(taskType, task);
```
**Use Cases:**
- Research tasks
- Shopping assistance
- Content extraction
- Data analysis

#### 5. **Web Dev Assistant** (`scripts/webdev.js`)
```javascript
// Code generation and help
const code = await generateCode(request);
```
**Use Cases:**
- Code generation
- Bug fixes
- Code explanations
- Component creation

---

## 💡 New Use Cases to Implement

### 1. **Smart Form Filler**

**Problem:** Filling forms is tedious and repetitive.

**Solution:**
```javascript
// scripts/smart-forms.js
async function autoFillForm() {
  const formFields = extractFormFields(document);
  const userContext = await getUserContext();
  
  const session = await window.chromeAI.createPromptSession();
  
  const filledData = await session.prompt(`
    Fill this form intelligently:
    Fields: ${JSON.stringify(formFields)}
    User context: ${userContext}
    Return as JSON matching the field structure.
  `, {
    responseConstraint: {
      type: "object",
      properties: formFields
    }
  });
  
  applyFormData(JSON.parse(filledData));
}
```

**When to use:**
- Job applications
- Contact forms
- Survey responses
- Registration forms

---

### 2. **Content Categorizer**

**Problem:** Need to organize bookmarks, articles, tabs.

**Solution:**
```javascript
// scripts/categorizer.js
async function categorizeContent(url, title, content) {
  const session = await window.chromeAI.createPromptSession({
    temperature: 0.3  // Lower for consistent categorization
  });
  
  const category = await session.prompt(`
    Categorize this content:
    Title: ${title}
    Content: ${content.substring(0, 500)}
    
    Choose from: Technology, Business, Health, Entertainment, 
                 Education, News, Shopping, Other
  `);
  
  return category.trim();
}

// Auto-tag bookmarks
chrome.bookmarks.onCreated.addListener(async (id, bookmark) => {
  const category = await categorizeContent(
    bookmark.url,
    bookmark.title,
    await fetchPageContent(bookmark.url)
  );
  
  chrome.bookmarks.update(id, {
    title: `[${category}] ${bookmark.title}`
  });
});
```

**When to use:**
- Organize bookmarks
- Filter reading lists
- Sort research tabs
- Manage saved articles

---

### 3. **Intelligent Page Summarizer**

**Problem:** Too much content, not enough time.

**Solution:**
```javascript
// scripts/summarizer.js
async function smartSummarize(content, style = 'brief') {
  const session = await window.chromeAI.createPromptSession();
  
  const prompts = {
    brief: 'Summarize in 2-3 sentences',
    bullets: 'Extract key points as bullet points',
    tldr: 'Create a TL;DR in one sentence',
    detailed: 'Provide a comprehensive summary with main points'
  };
  
  const summary = await session.prompt(`
    ${prompts[style]}:
    
    ${content}
  `);
  
  return summary;
}

// Add to context menu
chrome.contextMenus.create({
  title: "Summarize Page",
  contexts: ["page"],
  onclick: async (info, tab) => {
    const content = await getPageContent(tab.id);
    const summary = await smartSummarize(content, 'brief');
    showNotification('Page Summary', summary);
  }
});
```

**When to use:**
- Quick article scanning
- Research paper overviews
- News digest
- Study notes

---

### 4. **Smart Reply Generator**

**Problem:** Writing responses takes time.

**Solution:**
```javascript
// scripts/smart-reply.js
async function generateReply(originalMessage, context, tone = 'professional') {
  const session = await window.chromeAI.createPromptSession({
    systemPrompt: `Generate ${tone} replies to messages.`
  });
  
  const reply = await session.prompt(`
    Original message: ${originalMessage}
    Context: ${context}
    
    Generate an appropriate reply.
  `);
  
  return reply;
}

// Integrate with email/messaging
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('reply-button')) {
    const original = getOriginalMessage(e.target);
    const reply = await generateReply(original, getUserContext());
    insertReply(reply);
  }
});
```

**When to use:**
- Email replies
- Message responses
- Comment replies
- Customer support

---

### 5. **Content Rewriter**

**Problem:** Need to adjust tone or style of text.

**Solution:**
```javascript
// scripts/rewriter.js
async function rewriteText(text, targetStyle) {
  const session = await window.chromeAI.createPromptSession();
  
  const styles = {
    professional: 'Rewrite in professional business style',
    casual: 'Rewrite in friendly, casual style',
    simple: 'Simplify using basic language',
    concise: 'Make more concise and direct',
    formal: 'Rewrite in formal academic style'
  };
  
  const rewritten = await session.prompt(`
    ${styles[targetStyle]}:
    
    ${text}
  `);
  
  return rewritten;
}

// Add to context menu
chrome.contextMenus.create({
  title: "Rewrite Selection",
  contexts: ["selection"],
  onclick: async (info) => {
    const rewritten = await rewriteText(info.selectionText, 'professional');
    copyToClipboard(rewritten);
    showNotification('Text Rewritten', 'Copied to clipboard!');
  }
});
```

**When to use:**
- Professional communication
- Simplify complex text
- Adjust email tone
- Improve clarity

---

### 6. **Data Extractor**

**Problem:** Extract structured data from pages.

**Solution:**
```javascript
// scripts/data-extractor.js
async function extractProductInfo(html) {
  const session = await window.chromeAI.createPromptSession();
  
  const schema = {
    type: "object",
    properties: {
      name: { type: "string" },
      price: { type: "number" },
      rating: { type: "number" },
      features: { type: "array", items: { type: "string" } },
      inStock: { type: "boolean" }
    }
  };
  
  const data = await session.prompt(`
    Extract product information from this HTML:
    ${html}
    
    Return as JSON matching the schema.
  `, {
    responseConstraint: schema
  });
  
  return JSON.parse(data);
}

// Compare products across tabs
async function compareProducts(tabs) {
  const products = [];
  
  for (const tab of tabs) {
    const html = await getTabContent(tab.id);
    const info = await extractProductInfo(html);
    products.push({ ...info, url: tab.url });
  }
  
  return products;
}
```

**When to use:**
- Price comparison
- Product research
- Contact extraction
- Event details
- Recipe collection

---

### 7. **Q&A on Multiple Pages**

**Problem:** Need to find information across multiple tabs.

**Solution:**
```javascript
// scripts/multi-tab-qa.js
async function answerFromMultipleTabs(question) {
  const tabs = await chrome.tabs.query({});
  const contents = await Promise.all(
    tabs.map(tab => getTabContent(tab.id))
  );
  
  const session = await window.chromeAI.createPromptSession();
  
  const answer = await session.prompt(`
    Question: ${question}
    
    Find the answer from these sources:
    ${contents.map((c, i) => `
      Source ${i + 1} (${tabs[i].title}):
      ${c.substring(0, 1000)}
    `).join('\n\n')}
  `);
  
  return answer;
}
```

**When to use:**
- Research across sources
- Find best price
- Compare options
- Fact checking

---

### 8. **Smart Translator**

**Problem:** Translate with context awareness.

**Solution:**
```javascript
// scripts/smart-translate.js
async function contextAwareTranslate(text, targetLang, context) {
  const session = await window.chromeAI.createPromptSession();
  
  const translated = await session.prompt(`
    Translate to ${targetLang} considering context:
    
    Context: ${context}
    Text: ${text}
    
    Provide natural, contextually appropriate translation.
  `);
  
  return translated;
}
```

**When to use:**
- Translate web content
- International emails
- Chat messages
- Document translation

---

### 9. **Meeting Note Taker**

**Problem:** Summarize meeting content.

**Solution:**
```javascript
// scripts/meeting-notes.js
async function generateMeetingNotes(transcript) {
  const session = await window.chromeAI.createPromptSession();
  
  const notes = await session.prompt(`
    Create structured meeting notes from this transcript:
    
    ${transcript}
    
    Include:
    - Key decisions
    - Action items
    - Important points
    - Follow-ups needed
  `);
  
  return notes;
}
```

**When to use:**
- Google Meet/Zoom notes
- Call summaries
- Discussion points
- Action items

---

### 10. **Code Review Assistant**

**Problem:** Need quick code feedback.

**Solution:**
```javascript
// scripts/code-reviewer.js
async function reviewCode(code, language) {
  const session = await window.chromeAI.createPromptSession({
    systemPrompt: 'You are an expert code reviewer.'
  });
  
  const review = await session.prompt(`
    Review this ${language} code:
    
    ${code}
    
    Provide:
    - Potential bugs
    - Performance issues
    - Best practice suggestions
    - Security concerns
  `);
  
  return review;
}
```

**When to use:**
- GitHub PR reviews
- Code learning
- Bug hunting
- Best practices

---

## 🚀 Implementation Priority

### High Priority (Easy wins)
1. ✅ **Content Summarizer** - Already partially implemented
2. 🔄 **Smart Form Filler** - High user value
3. 🔄 **Content Categorizer** - Organize bookmarks
4. 🔄 **Smart Reply** - Email assistance

### Medium Priority
5. 🔄 **Content Rewriter** - Writing improvement
6. 🔄 **Data Extractor** - Structured data
7. 🔄 **Q&A Multiple Tabs** - Research tool
8. 🔄 **Code Reviewer** - Dev tools

### Future Features
9. 🔄 **Smart Translator** - Language support
10. 🔄 **Meeting Notes** - Productivity

---

## 📊 Performance Tips

### 1. **Cache Sessions**
```javascript
// Reuse sessions for similar tasks
const sessionCache = new Map();

async function getCachedSession(type) {
  if (!sessionCache.has(type)) {
    sessionCache.set(type, await createSession(type));
  }
  return sessionCache.get(type);
}
```

### 2. **Batch Requests**
```javascript
// Process multiple items together
async function batchProcess(items) {
  const session = await getSession();
  
  return await session.prompt(`
    Process these items:
    ${items.map((item, i) => `${i + 1}. ${item}`).join('\n')}
  `);
}
```

### 3. **Use Streaming for Long Responses**
```javascript
// Better UX for lengthy content
const stream = session.promptStreaming(longPrompt);
for await (const chunk of stream) {
  updateUI(chunk);
}
```

---

## 🎯 Best Practices

1. **Clear Prompts**: Be specific about what you want
2. **Context**: Provide relevant information
3. **Constraints**: Use JSON Schema for structured output
4. **Temperature**: Lower (0.3) for facts, higher (0.8) for creativity
5. **Session Management**: Reuse when possible, destroy when done
6. **Error Handling**: Always have fallbacks
7. **User Feedback**: Show loading states and progress

---

## 📚 Resources

- [Chrome Prompt API Docs](https://developer.chrome.com/docs/ai/prompt-api)
- [Extension Implementation](../scripts/ai-apis.js)
- [Test Page](../test-chrome-official-api.html)
- [Use Case Examples](../docs/AI-APIS-STATUS.md)

