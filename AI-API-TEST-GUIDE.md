# 🧪 Chrome AI API Testing Guide

## Quick Start

### 1. Visual Test Page (Easiest)
Open `test-ai-apis.html` in Chrome:
```bash
# Just double-click or open in browser
file:///path/to/browser-agent-extension/test-ai-apis.html
```

**Features:**
- 🚀 **Quick Test** - Fast check (~2 seconds)
- 🧪 **Full Test** - Comprehensive testing (~20-30 seconds)
- 📊 **Check APIs** - Detailed capability info
- 💬 **Test Prompt** - Try a real AI conversation

### 2. Console Commands (For Developers)

Open Chrome DevTools (F12) and run:

#### Quick Check
```javascript
// Fast overview of available APIs
await window.chromeAI.quickTestAIAPIs();
```

#### Full Test Suite
```javascript
// Comprehensive test with actual API calls
const results = await window.chromeAI.testAllAIAPIs();

// Silent mode (no console output)
const results = await window.chromeAI.testAllAIAPIs(false);
console.log(results);
```

#### Check API Availability
```javascript
// Detailed status of all APIs
const apis = await window.chromeAI.checkAIAPIs();
```

#### Check Prompt API Options
```javascript
// See which prompt API is recommended
const status = await window.chromeAI.checkPromptAPIAvailability();
console.log('Recommended:', status.recommended);
```

## What Gets Tested

### ✅ Primary APIs
- **Language Model** (`window.ai.languageModel`) - Main Chrome AI
  - Existence check
  - Capability check
  - Session creation
  - Prompt test
  - Session cleanup

### 🔬 Experimental APIs
- **Prompt API** (`self.ai.prompt`) - Alternative API
- **Summarizer** (`self.ai.summarizer`) - Text summarization
- **Writer** (`self.ai.writer`) - Content generation
- **Rewriter** (`self.ai.rewriter`) - Text improvement
- **Translator** (`self.translation`) - Language translation
- **Language Detector** (`self.ai.languageDetector`) - Language detection

### 🔧 Legacy APIs
- **createTextSession** (`window.ai.createTextSession`)
- **Global LanguageModel** (`LanguageModel`)

## Sample Output

### Quick Test
```
🚀 Quick AI API Check...

┌──────────────────┬──────────────────────────┐
│    ✅ Recommended │ window.ai.languageModel  │
│   🔬 Experimental │ null                     │
│      📝 Task APIs │ []                       │
│         🔧 Legacy │ []                       │
└──────────────────┴──────────────────────────┘

✅ Chrome AI is ready!
```

### Full Test
```
═══════════════════════════════════════════════════
🧪 CHROME AI APIs - COMPREHENSIVE TEST MODE
═══════════════════════════════════════════════════

Chrome Version: 127
Test Time: 10/2/2025, 2:30:45 PM

🔍 Testing Language Model API (window.ai.languageModel)...
   ✅ API exists
   ✅ API available (readily)
   ✅ Session created successfully
   ✅ Prompt test passed: "Test successful..."
   ✅ Session destroyed successfully

🔍 Testing Prompt API (self.ai.prompt)...
   ⏭️  API not found (experimental feature)

🔍 Testing Summarizer API (self.ai.summarizer)...
   ⏭️  API not found

🔍 Testing Writer API (self.ai.writer)...
   ⏭️  API not found

🔍 Testing Rewriter API (self.ai.rewriter)...
   ⏭️  API not found

🔍 Testing Translator API (self.translation)...
   ⏭️  API not found (in development)

🔍 Testing Language Detector API (self.ai.languageDetector)...
   ⏭️  API not found

🔍 Testing Legacy APIs...
   ⏭️  window.ai.createTextSession not found
   ⏭️  Global LanguageModel not found

═══════════════════════════════════════════════════
📊 TEST SUMMARY
═══════════════════════════════════════════════════
✅ Passed:  5
❌ Failed:  0
⏭️  Skipped: 10
📝 Total:   15
═══════════════════════════════════════════════════

✅ Chrome AI is ready!
```

## Interpreting Results

### Status Indicators
- ✅ **Passed** - API exists and works correctly
- ❌ **Failed** - API exists but returned an error
- ⏭️ **Skipped** - API not available (not an error)

### Common Scenarios

#### Scenario 1: Chrome AI Not Enabled
```
❌ Failed: 1
✅ Passed: 0
⏭️ Skipped: 14

💡 RECOMMENDATIONS:
   • Enable Chrome AI in chrome://flags
   • Search for "Optimization Guide On Device Model"
   • Set to "Enabled BypassPerfRequirement"
   • Restart Chrome
```

#### Scenario 2: Chrome AI Working
```
✅ Passed: 5-7
❌ Failed: 0
⏭️ Skipped: 8-10

✅ Chrome AI is ready!
```

#### Scenario 3: Model Needs Download
```
🔍 Testing Language Model API...
   ✅ API exists
   ✅ API available (after-download)
   ⏭️ Skipped live test (model needs download)
```

## Troubleshooting

### Chrome AI Not Detected

1. **Enable Chrome AI**
   ```
   chrome://flags/#optimization-guide-on-device-model
   → Set to "Enabled BypassPerfRequirement"
   → Restart Chrome
   ```

2. **Check Chrome Version**
   - Minimum: Chrome 127+
   - Recommended: Latest Chrome Canary/Dev

3. **Check System Requirements**
   - RAM: 8GB+ recommended
   - Storage: ~1-2GB for AI models
   - OS: Windows 10+, macOS 13+, Linux (supported)

### Script Not Loading

If you see "Chrome AI script not loaded":
1. Make sure `scripts/ai-apis.js` exists
2. Check browser console for errors
3. Try hard refresh (Ctrl+Shift+R)

### Test Hangs or Times Out

1. Close other tabs to free memory
2. Wait for model download (first run only)
3. Check network/disk space for model download

## Integration with Extension

The test functions are available in all extension pages:

### In Sidepanel
```javascript
// Check if AI is working before using
const status = await window.chromeAI.quickTestAIAPIs();
```

### In Background Scripts
```javascript
// Run diagnostic on startup
chrome.runtime.onInstalled.addListener(async () => {
  const results = await window.chromeAI.testAllAIAPIs(false);
  console.log('AI Status:', results.summary);
});
```

### In Content Scripts
Make sure to inject the script first:
```javascript
const script = document.createElement('script');
script.src = chrome.runtime.getURL('scripts/ai-apis.js');
document.head.appendChild(script);
```

## API Reference

### Test Functions

#### `testAllAIAPIs(verbose = true)`
Runs comprehensive tests on all APIs.
- **verbose**: Show console output (default: true)
- **Returns**: Detailed results object with summary

#### `quickTestAIAPIs()`
Fast check without running actual tests.
- **Returns**: Object with available APIs

#### `checkAIAPIs()`
Check capabilities of all APIs.
- **Returns**: Detailed capability information

#### `checkPromptAPIAvailability()`
Check which prompt API is best to use.
- **Returns**: Status object with recommended API

## Best Practices

1. **Run Quick Test First**
   - Fast overview before detailed testing
   - Good for startup checks

2. **Use Full Test for Debugging**
   - When AI features aren't working
   - After Chrome updates
   - When troubleshooting user issues

3. **Check Before Creating Sessions**
   ```javascript
   const status = await window.chromeAI.checkPromptAPIAvailability();
   if (status.recommended) {
     // Safe to create session
     const session = await window.chromeAI.createPromptSession();
   }
   ```

4. **Handle Failures Gracefully**
   ```javascript
   try {
     const session = await window.chromeAI.createPromptSession();
     // Use AI
   } catch (error) {
     // Fallback to templates or external API
   }
   ```

## Resources

- [Chrome Built-in AI Docs](https://developer.chrome.com/docs/ai/built-in)
- [AI-APIS-STATUS.md](./docs/AI-APIS-STATUS.md) - Detailed API status
- [Chrome AI Samples](https://github.com/GoogleChromeLabs/chrome-ai-samples)

## Contributing

Found an issue or want to improve tests? Contributions welcome!

1. Add new test functions to `scripts/ai-apis.js`
2. Update this guide
3. Test with different Chrome versions
4. Submit PR with test results

---

**Last Updated:** October 2, 2025
**Chrome Version Tested:** 127+
**Status:** ✅ All Systems Operational

