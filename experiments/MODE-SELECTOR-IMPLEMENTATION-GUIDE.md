# 🔧 Mode Selector - Complete Implementation Guide

## ✅ **Currently Implemented**

### **1. Article Summarizer** ✅
- **File**: `summarizer/article-summary.html`
- **Status**: ✅ Complete with mode selector

### **2. Document Batch Translator** ✅
- **File**: `translator/document-batch.html`
- **Status**: ✅ Complete with mode selector

---

## 🎨 **The Mode Selector Pattern**

Every experiment can have this UI to let users choose their AI mode!

```
┌────────────────────────────────────────────────┐
│  🔧 Select AI Mode:                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │🚀 Modern │ │⚡ Legacy │ │🎮 Demo   │      │
│  │  Expert  │ │  Gen LLM │ │ Simulated│      │
│  └──────────┘ └──────────┘ └──────────┘      │
└────────────────────────────────────────────────┘
```

---

## 📝 **Implementation Steps**

### **Step 1: Add CSS** (in `<style>` tag)

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

### **Step 2: Add HTML** (in `<body>`, after status div)

```html
<div class="mode-selector">
  <label>🔧 Select AI Mode:</label>
  <div class="mode-options">
    <button class="mode-btn" id="modernBtn" onclick="switchMode('modern')" disabled>
      <strong>🚀 Modern API</strong>
      <small style="display:block; margin-top:4px;">Specialized Model</small>
    </button>
    <button class="mode-btn active" id="legacyBtn" onclick="switchMode('legacy')" disabled>
      <strong>⚡ Legacy API</strong>
      <small style="display:block; margin-top:4px;">General LLM</small>
    </button>
    <button class="mode-btn" id="demoBtn" onclick="switchMode('demo')">
      <strong>🎮 Demo Mode</strong>
      <small style="display:block; margin-top:4px;">Simulated</small>
    </button>
  </div>
</div>
```

---

### **Step 3: Add JavaScript** (in `<script>` tag)

```javascript
let apiMode = 'none'; // 'modern', 'legacy', 'demo'
let legacySession = null;
let availableModes = [];

// Check API availability on load
window.addEventListener('load', async () => {
  const status = document.getElementById('status');
  availableModes = [];
  
  try {
    // Check Modern API (replace with appropriate API check)
    if ('ai' in window && 'summarizer' in window.ai) {
      availableModes.push('modern');
      document.getElementById('modernBtn').disabled = false;
      document.getElementById('modernBtn').classList.remove('disabled');
    }
    
    // Check Legacy LanguageModel
    if (typeof LanguageModel !== 'undefined') {
      const availability = await LanguageModel.availability();
      if (availability === 'readily' || availability === 'available') {
        availableModes.push('legacy');
        document.getElementById('legacyBtn').disabled = false;
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
  // Update mode
  apiMode = mode;
  
  // Update button states
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(mode + 'Btn').classList.add('active');
  
  // Update status
  const status = document.getElementById('status');
  
  if (mode === 'modern') {
    status.className = 'status success';
    status.innerHTML = '✅ <strong>Modern API Active</strong> - Using specialized model';
  } else if (mode === 'legacy') {
    status.className = 'status success';
    status.innerHTML = '✅ <strong>Legacy API Active</strong> - Using LanguageModel (General LLM)';
  } else {
    status.className = 'status';
    status.style.background = '#fff3e0';
    status.style.color = '#e65100';
    status.innerHTML = '⚠️ <strong>Demo Mode Active</strong> - Using simulated responses';
  }
  
  console.log(`Switched to ${mode} mode`);
}
```

---

### **Step 4: Update Your Main Function**

```javascript
async function yourMainFunction() {
  // ... your existing code ...
  
  if (apiMode === 'modern') {
    // Use Modern API
    const api = await ai.yourAPI.create();
    result = await api.process(input);
  } 
  else if (apiMode === 'legacy') {
    // Use Legacy LanguageModel
    if (!legacySession) {
      legacySession = await LanguageModel.create({
        temperature: 0.3,
        topK: 3,
        outputLanguage: 'en'
      });
    }
    const prompt = `Your task instruction: ${input}`;
    result = await legacySession.prompt(prompt);
  } 
  else {
    // Demo mode
    await new Promise(r => setTimeout(r, 1000));
    result = `[Demo] Simulated result`;
  }
  
  // Display result...
}
```

---

## 🎯 **Experiments Ready for Mode Selector**

### **Priority 1: Easy to Add** 🟢

| Experiment | File | API Used | Difficulty |
|-----------|------|----------|-----------|
| Review Digest | `summarizer/review-digest.html` | Summarizer | Easy ✅ |
| Webpage Translator | `translator/webpage-translator.html` | Translator | Easy ✅ |

### **Priority 2: Moderate** 🟡

| Experiment | File | API Used | Difficulty |
|-----------|------|----------|-----------|
| Multilingual Chat | `translator/multilingual-chat.html` | Translator | Medium 🟡 |
| Audio Transcriber | `multimodal/audio-transcriber.html` | Multimodal | Medium 🟡 |

### **Priority 3: Simple Pages** 🟢

| Experiment | File | API Used | Difficulty |
|-----------|------|----------|-----------|
| Smart Input | `language-detector/smart-input.html` | Language Detector | Easy ✅ |
| Content Routing | `language-detector/content-routing.html` | Language Detector | Easy ✅ |

---

## 📊 **API Detection Examples**

### **For Summarizer API**:
```javascript
if ('ai' in window && 'summarizer' in window.ai) {
  // Modern Summarizer available
}
```

### **For Translator API**:
```javascript
if ('translation' in self) {
  // Modern Translation available
}
```

### **For Language Detector**:
```javascript
if ('translation' in self && 'languageDetector' in translation) {
  // Modern Language Detector available
}
```

### **For Prompt API**:
```javascript
if ('ai' in window && 'languageModel' in window.ai) {
  // Modern Prompt API available
}
```

---

## 🎨 **Customization Tips**

### **Change Colors**:
```css
/* Green theme instead of purple */
.mode-btn.active { 
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); 
}
```

### **Vertical Layout Instead of Horizontal**:
```css
.mode-options { 
  display: flex; 
  flex-direction: column;  /* ← Change this */
  gap: 10px; 
}
```

### **Different Button Text**:
```html
<button class="mode-btn" id="modernBtn" onclick="switchMode('modern')">
  <strong>🎯 Professional</strong>
  <small>Best Quality</small>
</button>
```

---

## ✅ **Benefits**

### **1. User Control** 🎮
```
Users see all options
Users choose what they want
Clear visual feedback
```

### **2. Educational** 📚
```
Users learn the differences
Modern vs Legacy explained
Transparency builds trust
```

### **3. Testing** 🧪
```
Easy to compare results
Switch modes instantly
Perfect for demos
```

### **4. Future-Proof** 🚀
```
Easy to add new modes
Easy to update
Scalable pattern
```

---

## 🚀 **Next Steps**

1. **Copy the pattern** from `article-summary.html` or `document-batch.html`
2. **Adjust the API detection** for your specific API
3. **Update the main function** to use `apiMode`
4. **Test all three modes** to ensure they work
5. **Update status messages** to be clear and helpful

---

## 📝 **Quick Checklist**

When implementing mode selector:

- [ ] Add mode selector CSS
- [ ] Add mode selector HTML
- [ ] Add `apiMode` variable
- [ ] Add `availableModes` array
- [ ] Add `window.addEventListener('load')` for detection
- [ ] Add `switchMode()` function
- [ ] Update main function to check `apiMode`
- [ ] Add Legacy API with `outputLanguage: 'en'`
- [ ] Add Demo mode with simulated response
- [ ] Test all three modes
- [ ] Verify button states (disabled/active)
- [ ] Check contrast and visibility

---

**Status**: ✅ **Pattern Documented**  
**Examples**: 2 complete implementations  
**Ready to Scale**: To all experiments! 🚀

