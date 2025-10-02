# 🔧 Troubleshooting Chrome Built-in AI APIs

## ❌ Error: "ai is not defined"

This means Chrome's modern AI APIs aren't enabled yet.

### **3 Alternative Solutions:**

---

## ✅ **Solution 1: Enable Chrome Flags** (Recommended)

**Enable the modern API:**

```bash
1. Open: chrome://flags/#optimization-guide-on-device-model
   → Set to: "Enabled BypassPerfRequirement"

2. Open: chrome://flags/#prompt-api-for-gemini-nano
   → Set to: "Enabled"

3. Open: chrome://flags/#summarization-api-for-gemini-nano
   → Set to: "Enabled"

4. Open: chrome://flags/#translation-api
   → Set to: "Enabled"

5. Restart Chrome

6. Check status: chrome://on-device-internals
```

**Requirements:**
- Chrome 138+ (Stable/Dev/Canary)
- 22GB+ free storage
- 4GB+ VRAM

---

## ✅ **Solution 2: Use Legacy LanguageModel API** (Works Now!)

If the modern `ai.languageModel` isn't available, use the **Legacy API**:

```javascript
// Check availability
const availability = await LanguageModel.availability();
console.log(availability); // "readily", "after-download", or "no"

// Create session
const session = await LanguageModel.create({
  temperature: 0.7,
  topK: 3,
  systemPrompt: 'You are a helpful assistant.'
});

// Use it
const response = await session.prompt('Hello!');
console.log(response);

// Cleanup
session.destroy();
```

**Advantages:**
- ✅ Works on older Chrome versions
- ✅ Same on-device privacy
- ✅ Zero cost
- ✅ No flags needed (sometimes)

**Check if available:**
```javascript
if (typeof LanguageModel !== 'undefined') {
  console.log('✅ Legacy API available!');
}
```

---

## ✅ **Solution 3: Hybrid Fallback Pattern** (Production Ready)

Use this pattern for **production apps**:

```javascript
async function getAIResponse(message) {
  // Try Modern API
  try {
    if ('ai' in self && 'languageModel' in ai) {
      const session = await ai.languageModel.create();
      const response = await session.prompt(message);
      session.destroy();
      return { response, mode: 'modern' };
    }
  } catch (error) {
    console.log('Modern API failed, trying legacy...');
  }

  // Try Legacy API
  try {
    if (typeof LanguageModel !== 'undefined') {
      const session = await LanguageModel.create();
      const response = await session.prompt(message);
      session.destroy();
      return { response, mode: 'legacy' };
    }
  } catch (error) {
    console.log('Legacy API failed, using cloud...');
  }

  // Fallback to Cloud API
  try {
    const response = await fetch('/api/cloud-ai', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await response.json();
    return { response: data.text, mode: 'cloud' };
  } catch (error) {
    throw new Error('All AI methods failed');
  }
}

// Usage
const { response, mode } = await getAIResponse('Hello!');
console.log(`Response (${mode}):`, response);
```

---

## 🎯 **Quick Diagnosis**

Run this in your browser console:

```javascript
// Check what's available
console.log('=== Chrome AI Availability ===');

// Modern API
console.log('Modern (ai.languageModel):', 
  'ai' in self && 'languageModel' in ai ? '✅ Available' : '❌ Not available');

// Legacy API
console.log('Legacy (LanguageModel):', 
  typeof LanguageModel !== 'undefined' ? '✅ Available' : '❌ Not available');

// Summarizer
console.log('Summarizer:', 
  'ai' in self && 'summarizer' in ai ? '✅ Available' : '❌ Not available');

// Translator
console.log('Translator:', 
  'translation' in self ? '✅ Available' : '❌ Not available');

// Check capabilities
if ('ai' in self && 'languageModel' in ai) {
  ai.languageModel.capabilities().then(caps => {
    console.log('Capabilities:', caps);
  });
}

if (typeof LanguageModel !== 'undefined') {
  LanguageModel.availability().then(avail => {
    console.log('Legacy availability:', avail);
  });
}
```

---

## 🆘 **Common Issues & Fixes**

### **Issue: "After-download" status but nothing happens**

**Fix:**
```javascript
// Manually trigger download
const session = await ai.languageModel.create();
// Wait for download to complete
// Check: chrome://on-device-internals
```

### **Issue: "Not enough storage"**

**Fix:**
- Free up 22GB+ space
- Check: Settings → Storage

### **Issue: "GPU not supported"**

**Fix:**
- Requires 4GB+ VRAM
- Check: chrome://gpu
- Consider cloud fallback

### **Issue: "Works on desktop, not mobile"**

**Explanation:**
- Most APIs are desktop-only currently
- Mobile support coming in future Chrome versions
- Use cloud fallback for mobile

### **Issue: "Legacy API works but deprecated"**

**Fix:**
- Legacy API (`LanguageModel`) still supported
- Gradually migrate to modern `ai.languageModel`
- Use hybrid pattern during transition

---

## 📊 **API Comparison**

| Feature | Modern API | Legacy API | Cloud API |
|---------|-----------|------------|-----------|
| **Privacy** | ✅ 100% local | ✅ 100% local | ❌ Cloud-based |
| **Cost** | ✅ $0 | ✅ $0 | ❌ $1-$8/1K |
| **Speed** | ✅ <100ms | ✅ <100ms | ❌ 500-2000ms |
| **Offline** | ✅ Yes | ✅ Yes | ❌ No |
| **Availability** | Chrome 138+ | Chrome 127+ | ✅ Always |
| **Setup** | Flags needed | Sometimes auto | API key needed |

---

## 🎓 **Best Practices**

### **1. Always Feature-Detect**

```javascript
// ❌ BAD - Assumes API exists
const session = await ai.languageModel.create();

// ✅ GOOD - Check first
if ('ai' in self && 'languageModel' in ai) {
  const session = await ai.languageModel.create();
} else {
  console.error('API not available');
}
```

### **2. Implement Fallbacks**

```javascript
// ✅ Production-ready pattern
async function summarizeText(text) {
  // Try on-device
  try {
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
    body: JSON.stringify({ text })
  });
  return await response.json();
}
```

### **3. Cache Sessions**

```javascript
// ✅ Reuse sessions for better performance
let cachedSession = null;

async function getSession() {
  if (!cachedSession) {
    cachedSession = await ai.languageModel.create();
  }
  return cachedSession;
}

// Use it
const session = await getSession();
const response = await session.prompt('Hello');
```

---

## 🔗 **Helpful Links**

- **Check API Status**: chrome://on-device-internals
- **Check GPU**: chrome://gpu
- **Chrome Flags**: chrome://flags
- **Official Docs**: https://developer.chrome.com/docs/ai/built-in
- **Report Issues**: https://issues.chromium.org

---

## 💡 **TL;DR**

**If you see "ai is not defined":**

1. ✅ **Quickest**: Use Legacy `LanguageModel` API (works now!)
2. ✅ **Best**: Enable Chrome flags and restart
3. ✅ **Production**: Use hybrid fallback pattern

**Copy-paste this code to test:**

```javascript
// Test what's available
async function testAI() {
  try {
    // Try modern
    if ('ai' in self && 'languageModel' in ai) {
      const session = await ai.languageModel.create();
      const result = await session.prompt('Say hello!');
      console.log('✅ Modern API works:', result);
      session.destroy();
      return;
    }
    
    // Try legacy
    if (typeof LanguageModel !== 'undefined') {
      const session = await LanguageModel.create();
      const result = await session.prompt('Say hello!');
      console.log('✅ Legacy API works:', result);
      session.destroy();
      return;
    }
    
    console.log('❌ No on-device AI available');
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAI();
```

---

**Last Updated**: October 2025  
**Chrome Version**: 138+  
**Status**: Always keep fallbacks! 🔄

