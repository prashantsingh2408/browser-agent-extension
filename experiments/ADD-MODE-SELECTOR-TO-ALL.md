# 🔧 Add Mode Selector to ALL Experiments - Complete Guide

## ✅ **Already Complete**

1. ✅ `summarizer/article-summary.html` - Has mode selector
2. ✅ `translator/document-batch.html` - Has mode selector

---

## 📋 **To Update (Copy-Paste Ready!)**

### **1. Review Digest** (`summarizer/review-digest.html`)
### **2. Multilingual Chat** (`translator/multilingual-chat.html`)
### **3. Webpage Translator** (`translator/webpage-translator.html`)
### **4. Smart Input** (`language-detector/smart-input.html`)
### **5. Content Routing** (`language-detector/content-routing.html`)
### **6. Audio Transcriber** (`multimodal/audio-transcriber.html`)

---

## 🎨 **STEP 1: Add CSS** (Before `</style>`)

```css
.mode-selector { 
  background: #f5f5f5; 
  padding: 15px; 
  border-radius: 8px; 
  margin-bottom: 20px; 
}
.mode-selector label { 
  display: block; 
  margin-bottom: 5px; 
  font-weight: 600; 
}
.mode-options { 
  display: flex; 
  gap: 10px; 
}
.mode-btn { 
  flex: 1; 
  padding: 10px; 
  border: 2px solid #e0e0e0; 
  background: white; 
  border-radius: 6px; 
  cursor: pointer; 
  transition: all 0.2s; 
  font-size: 14px; 
  color: #333; 
}
.mode-btn strong { 
  color: #333; 
  display: block; 
  margin-bottom: 4px; 
}
.mode-btn small { 
  color: #666; 
}
.mode-btn:hover { 
  border-color: #667eea; 
  background: #f0f0f0; 
}
.mode-btn.active { 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
  color: white; 
  border-color: #667eea; 
  font-weight: 600; 
}
.mode-btn.active strong { 
  color: white; 
}
.mode-btn.active small { 
  color: rgba(255, 255, 255, 0.9); 
}
.mode-btn.disabled { 
  opacity: 0.5; 
  cursor: not-allowed; 
}
```

---

## 📝 **STEP 2: Add HTML** (After title/description, before main content)

```html
<div class="mode-selector">
  <label>🔧 Select AI Mode:</label>
  <div class="mode-options">
    <button class="mode-btn disabled" id="modernBtn" onclick="switchMode('modern')">
      <strong>🚀 Modern API</strong>
      <small style="display:block; margin-top:4px;">Specialized</small>
    </button>
    <button class="mode-btn active" id="legacyBtn" onclick="switchMode('legacy')">
      <strong>⚡ Legacy API</strong>
      <small style="display:block; margin-top:4px;">General LLM</small>
    </button>
    <button class="mode-btn" id="demoBtn" onclick="switchMode('demo')">
      <strong>🎮 Demo</strong>
      <small style="display:block; margin-top:4px;">Simulated</small>
    </button>
  </div>
</div>
```

---

## 💻 **STEP 3: Add JavaScript** (At the TOP of `<script>`)

```javascript
let apiMode = 'none'; // 'modern', 'legacy', 'demo'
let legacySession = null;
let availableModes = [];

// Check API availability on load
window.addEventListener('load', async () => {
  availableModes = [];
  
  try {
    // Check Modern API (CHANGE THIS based on experiment type!)
    // For Summarizer: if ('ai' in window && 'summarizer' in window.ai)
    // For Translator: if ('translation' in self)
    // For Language Detector: if ('translation' in self && 'languageDetector' in translation)
    if ('ai' in window && 'summarizer' in window.ai) {  // ← CHANGE THIS!
      availableModes.push('modern');
      document.getElementById('modernBtn').classList.remove('disabled');
    }
    
    // Check Legacy LanguageModel
    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();
      if (availability === 'readily' || availability === 'available') {
        availableModes.push('legacy');
        document.getElementById('legacyBtn').classList.remove('disabled');
      }
    }
    
    // Demo is always available
    availableModes.push('demo');
    
    // Set default mode
    if (availableModes.includes('modern')) {
      switchMode('modern');
    } else if (availableModes.includes('legacy')) {
      switchMode('legacy');
    } else {
      switchMode('demo');
    }
    
  } catch (error) {
    console.error('API check failed:', error);
    switchMode('demo');
  }
});

function switchMode(mode) {
  // Check if mode is available
  const button = document.getElementById(mode + 'Btn');
  if (button.classList.contains('disabled')) {
    alert('⚠️ This mode is not available on your system.\n\n' + 
          (mode === 'modern' ? 
            'Modern API requires enabling Chrome flags' : 
            'This mode is not currently available.'));
    return;
  }
  
  // Update mode
  apiMode = mode;
  
  // Update button states
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  button.classList.add('active');
  
  console.log(`Switched to ${mode} mode`);
}
```

---

## 🔄 **STEP 4: Update Main Function**

Replace your existing function (e.g., `summarizeReviews()`, `translate()`, etc.) with:

```javascript
async function yourMainFunction() {
  // ... get input ...
  
  let result;
  
  if (apiMode === 'modern') {
    // ═══════════════════════════════════════
    // Use Modern API (KEEP EXISTING CODE)
    // ═══════════════════════════════════════
    const api = await ai.summarizer.create();  // ← Your existing modern API
    result = await api.summarize(input);
    api.destroy();
  } 
  else if (apiMode === 'legacy') {
    // ═══════════════════════════════════════
    // Use Legacy LanguageModel (NEW CODE)
    // ═══════════════════════════════════════
    if (!legacySession) {
      legacySession = await LanguageModel.create({
        temperature: 0.3,
        topK: 3,
        outputLanguage: 'en'  // or dynamic based on target
      });
    }
    
    // Create a good prompt based on your task
    const prompt = `Summarize these reviews: ${input}`;  // ← CUSTOMIZE THIS!
    result = await legacySession.prompt(prompt);
  } 
  else {
    // ═══════════════════════════════════════
    // Demo Mode (NEW CODE)
    // ═══════════════════════════════════════
    await new Promise(r => setTimeout(r, 1000));
    result = `[Demo] Simulated result for: ${input.substring(0, 50)}...`;
  }
  
  // Display result
  displayResult(result);
}
```

---

## 📊 **API Detection Reference**

Copy the right detection code for each experiment:

### **For Summarizer Experiments:**
```javascript
if ('ai' in window && 'summarizer' in window.ai) {
  // Modern Summarizer available
}
```

### **For Translator Experiments:**
```javascript
if ('translation' in self) {
  // Modern Translation available
}
```

### **For Language Detector Experiments:**
```javascript
if ('translation' in self && 'languageDetector' in translation) {
  // Modern Language Detector available
}
```

### **For Multimodal Experiments:**
```javascript
if ('ai' in window && 'languageModel' in window.ai) {
  // Modern Prompt API (with multimodal) available
}
```

---

## 📝 **Quick Checklist Per File**

- [ ] Add mode selector CSS to `<style>`
- [ ] Add mode selector HTML after title
- [ ] Add `apiMode`, `legacySession`, `availableModes` variables
- [ ] Add `window.addEventListener('load')` with API detection
- [ ] Add `switchMode()` function
- [ ] Update main function with if/else for apiMode
- [ ] Test all three modes work
- [ ] Verify buttons are clickable

---

## 🎯 **Priority Order**

### **Easy (5 minutes each):**
1. ✅ `summarizer/review-digest.html` - Simple, single function
2. ✅ `language-detector/smart-input.html` - Basic demo
3. ✅ `language-detector/content-routing.html` - Basic demo

### **Medium (10 minutes each):**
4. 🟡 `translator/webpage-translator.html` - Has some logic
5. 🟡 `multimodal/audio-transcriber.html` - Different API

### **Complex (15 minutes):**
6. 🟠 `translator/multilingual-chat.html` - Two-way chat, complex state

---

## 💡 **Pro Tips**

### **1. Test After Each Update**
```
1. Save file
2. Reload in browser
3. Click all 3 buttons
4. Verify they work
5. Move to next file
```

### **2. Copy from Working Examples**
```
✅ Reference: summarizer/article-summary.html
✅ Reference: translator/document-batch.html
```

### **3. Customize Prompts**
```javascript
// For summarization:
`Summarize this text: ${text}`

// For translation:
`Translate this English text to Spanish: "${text}"`

// For detection:
`What language is this text: "${text}"?`
```

---

## 🚀 **Result**

After completing all files:

```
✅ 8 total experiments
✅ All have mode selector
✅ All support Modern API
✅ All support Legacy API
✅ All have Demo mode
✅ Consistent UX across all experiments
```

---

**Status**: 📝 **Ready to implement**  
**Time Estimate**: 1-2 hours for all files  
**Benefit**: 🎯 **Consistent, professional UX everywhere!**

