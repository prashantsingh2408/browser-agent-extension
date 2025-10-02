# 🧪 AI Testing Feature in Extension Settings

## Overview

AI testing functionality has been integrated directly into the extension's Settings tab. Users can now test Chrome's built-in AI APIs without leaving the extension!

## Location

**Settings Tab → Chrome AI Testing & Diagnostics Section**

Navigate to:
1. Open extension sidepanel
2. Click **Settings** tab
3. Scroll to **"🧪 Chrome AI Testing & Diagnostics"** section

## Features

### 1. Quick Test Button (🚀)
- **Duration**: ~2 seconds
- **What it does**: Fast check of all available APIs
- **Best for**: Quick status check before using AI features

### 2. Full Test Button (🧪)
- **Duration**: ~20-30 seconds  
- **What it does**: Comprehensive test with actual AI calls
- **Best for**: Detailed diagnostics and troubleshooting

### 3. Check APIs Button (📊)
- **Duration**: ~5 seconds
- **What it does**: Detailed capability check for each API
- **Best for**: See exact configuration and availability

### 4. Status Badge
- Real-time Chrome AI status indicator
- Updates automatically when Settings tab opens
- Shows recommended API to use

## User Interface

### Test Buttons
```
[🚀 Quick Test (2s)]  [🧪 Full Test (30s)]  [📊 Check APIs]
```

### Results Display
- **Status Bar**: Color-coded (blue=running, green=success, yellow=warning, red=error)
- **Output Area**: Shows detailed test results in monospace font
- **Auto-scroll**: Results update in real-time during tests

### Status Badge
```
✅ Chrome AI Ready: window.ai.languageModel
```
or
```
⚠️ Chrome AI Not Detected
```

## Test Results Examples

### When Chrome AI is Working
```
✅ Chrome AI is ready! Using window.ai.languageModel

🚀 Quick AI API Check...

┌──────────────────┬──────────────────────────┐
│    ✅ Recommended │ window.ai.languageModel  │
│   🔬 Experimental │ null                     │
│      📝 Task APIs │ []                       │
│         🔧 Legacy │ []                       │
└──────────────────┴──────────────────────────┘

✅ Chrome AI is ready!
```

### When Chrome AI is NOT Enabled
```
⚠️ Chrome AI not detected. Enable in chrome://flags

Error: No AI model available

To enable Chrome AI:
1. Go to chrome://flags
2. Search for "Optimization Guide On Device Model"
3. Set to "Enabled BypassPerfRequirement"
4. Restart Chrome
```

## Files Modified

### 1. `sidepanel.html`
**Added**: AI Testing section with buttons and results area
- Location: Between "Advanced Settings" and "About" sections
- Lines: ~1763-1807

### 2. `scripts/settings.js`
**Added**: Test functions and event listeners
- `runQuickAITest()` - Quick test handler
- `runFullAITest()` - Full test handler
- `runCheckAPIs()` - API check handler
- `checkChromeAIStatus()` - Auto status checker
- Lines: ~378-621

### 3. `styles/sidepanel.css`
**Added**: Styling for test interface
- Button styles (quick, full, check)
- Results display styling
- Status badge styling
- Responsive design
- Lines: Appended to end

## Integration with Existing Code

### Already Loaded Scripts
- `scripts/ai-apis.js` - Already included in sidepanel.html
- All test functions available via `window.chromeAI` namespace

### Automatic Features
1. **Auto Status Check**: Runs when Settings tab opens
2. **Real-time Updates**: Test output updates during execution
3. **Console Integration**: Captures and displays console logs
4. **Error Handling**: Graceful fallback with helpful error messages

## Usage Guide for Users

### First Time Setup
1. Install extension
2. Open sidepanel
3. Go to **Settings** tab
4. Click **Quick Test (2s)**
5. If Chrome AI not detected, follow on-screen instructions

### Regular Usage
- Check status badge for quick info
- Run Quick Test before important AI tasks
- Run Full Test when troubleshooting issues
- Use Check APIs to see detailed configuration

### Troubleshooting
If tests fail:
1. Enable Chrome AI in `chrome://flags`
2. Search for "Optimization Guide On Device Model"
3. Set to "Enabled BypassPerfRequirement"
4. Restart Chrome
5. Run Full Test again

## Technical Details

### API Testing Coverage
- ✅ Language Model API (`window.ai.languageModel`)
- ✅ Prompt API (`self.ai.prompt`)
- ✅ Summarizer API (`self.ai.summarizer`)
- ✅ Writer API (`self.ai.writer`)
- ✅ Rewriter API (`self.ai.rewriter`)
- ✅ Translator API (`self.translation`)
- ✅ Language Detector API (`self.ai.languageDetector`)
- ✅ Legacy APIs (`createTextSession`, `LanguageModel`)

### Test Results Object
```javascript
{
  timestamp: "2025-10-02T14:30:45.123Z",
  browser: "Chrome/127.0.0.0",
  chromeVersion: "127",
  tests: {
    languageModel: { passed: 5, failed: 0, skipped: 0 },
    // ... more tests
  },
  summary: {
    total: 15,
    passed: 7,
    failed: 0,
    skipped: 8
  }
}
```

## Benefits

### For Users
- ✅ No need to open DevTools
- ✅ One-click testing
- ✅ Clear visual feedback
- ✅ Actionable error messages
- ✅ Real-time status updates

### For Developers
- ✅ Easy debugging
- ✅ Quick diagnostics
- ✅ Comprehensive test coverage
- ✅ Detailed logging
- ✅ Reusable test functions

## Future Enhancements

Possible additions:
- Export test results as JSON
- Scheduled automatic testing
- History of test results
- Performance benchmarks
- API latency measurements

## Related Files

- `scripts/ai-apis.js` - Core test functions
- `test-ai-apis.html` - Standalone test page
- `docs/AI-APIS-STATUS.md` - API documentation
- `AI-API-TEST-GUIDE.md` - Comprehensive testing guide

## Quick Reference

### Console Commands
```javascript
// If you prefer console over UI
await window.chromeAI.quickTestAIAPIs();
await window.chromeAI.testAllAIAPIs();
await window.chromeAI.checkAIAPIs();
```

### Status Check
```javascript
const status = await window.chromeAI.checkPromptAPIAvailability();
console.log('Recommended:', status.recommended);
```

---

**Last Updated**: October 2, 2025
**Feature Status**: ✅ Fully Integrated
**Tested On**: Chrome 127+

