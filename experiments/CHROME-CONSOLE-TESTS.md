# 🧪 Chrome Console Commands - Test AI APIs

## 🎯 Quick Test Commands

Open **Chrome DevTools** (F12) → **Console** tab, then run these commands:

---

## ✅ **Test 1: Check if Modern APIs Exist**

```javascript
// Quick check - all modern APIs
console.log('=== MODERN API CHECK ===');
console.log('ai object:', 'ai' in window ? '✅ EXISTS' : '❌ NOT FOUND');
console.log('languageModel:', 'ai' in window && 'languageModel' in window.ai ? '✅ EXISTS' : '❌ NOT FOUND');
console.log('summarizer:', 'ai' in window && 'summarizer' in window.ai ? '✅ EXISTS' : '❌ NOT FOUND');
console.log('translation:', 'translation' in self ? '✅ EXISTS' : '❌ NOT FOUND');
console.log('LanguageModel (legacy):', typeof LanguageModel !== 'undefined' ? '✅ EXISTS' : '❌ NOT FOUND');
```

---

## ✅ **Test 2: Check Language Model Availability**

```javascript
// Test Legacy LanguageModel
if (typeof LanguageModel !== 'undefined') {
  LanguageModel.availability().then(status => {
    console.log('✅ Legacy LanguageModel status:', status);
    // Expected: 'readily' or 'available' or 'after-download'
  });
} else {
  console.log('❌ Legacy LanguageModel not found');
}
```

---

## ✅ **Test 3: Check Modern Language Model**

```javascript
// Test Modern Prompt API
if ('ai' in window && 'languageModel' in window.ai) {
  window.ai.languageModel.capabilities().then(caps => {
    console.log('✅ Modern Prompt API capabilities:', caps);
    console.log('Available:', caps.available);
  }).catch(err => {
    console.log('❌ Error:', err.message);
  });
} else {
  console.log('❌ Modern Prompt API not found');
}
```

---

## ✅ **Test 4: Check Summarizer API**

```javascript
// Test Summarizer
if ('ai' in window && 'summarizer' in window.ai) {
  window.ai.summarizer.capabilities().then(caps => {
    console.log('✅ Summarizer API capabilities:', caps);
    console.log('Available:', caps.available);
  }).catch(err => {
    console.log('❌ Error:', err.message);
  });
} else {
  console.log('❌ Summarizer API not found');
}
```

---

## ✅ **Test 5: Check Translation API**

```javascript
// Test Translation
if ('translation' in self) {
  translation.canTranslate({
    sourceLanguage: 'en',
    targetLanguage: 'es'
  }).then(result => {
    console.log('✅ Translation API (en→es):', result);
    // Expected: 'readily', 'after-download', or 'no'
  }).catch(err => {
    console.log('❌ Error:', err.message);
  });
} else {
  console.log('❌ Translation API not found');
}
```

---

## 🎯 **Test 6: FULL STATUS CHECK (All-in-One)**

```javascript
// Complete status check
(async function checkAllAPIs() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║    CHROME AI APIs - FULL CHECK       ║');
  console.log('╚═══════════════════════════════════════╝\n');
  
  // 1. Modern Prompt API
  console.log('🔹 Modern Prompt API (ai.languageModel):');
  if ('ai' in window && 'languageModel' in window.ai) {
    try {
      const caps = await window.ai.languageModel.capabilities();
      console.log('   ✅ Status:', caps.available);
      console.log('   📊 Details:', caps);
    } catch (e) {
      console.log('   ❌ Error:', e.message);
    }
  } else {
    console.log('   ❌ Not available');
  }
  
  // 2. Summarizer API
  console.log('\n🔹 Summarizer API (ai.summarizer):');
  if ('ai' in window && 'summarizer' in window.ai) {
    try {
      const caps = await window.ai.summarizer.capabilities();
      console.log('   ✅ Status:', caps.available);
    } catch (e) {
      console.log('   ❌ Error:', e.message);
    }
  } else {
    console.log('   ❌ Not available');
  }
  
  // 3. Translation API
  console.log('\n🔹 Translation API (translation):');
  if ('translation' in self) {
    try {
      const canTranslate = await translation.canTranslate({
        sourceLanguage: 'en',
        targetLanguage: 'es'
      });
      console.log('   ✅ Status (en→es):', canTranslate);
    } catch (e) {
      console.log('   ❌ Error:', e.message);
    }
  } else {
    console.log('   ❌ Not available');
  }
  
  // 4. Legacy LanguageModel
  console.log('\n🔹 Legacy LanguageModel:');
  if (typeof LanguageModel !== 'undefined') {
    try {
      const status = await LanguageModel.availability();
      console.log('   ✅ Status:', status);
    } catch (e) {
      console.log('   ❌ Error:', e.message);
    }
  } else {
    console.log('   ❌ Not available');
  }
  
  console.log('\n╚═══════════════════════════════════════╝\n');
})();
```

---

## 🧪 **Test 7: Actually CREATE a Session (Real Test!)**

```javascript
// Try to create a REAL session
(async function testRealSession() {
  console.log('🧪 Testing REAL session creation...\n');
  
  // Try Modern API
  if ('ai' in window && 'languageModel' in window.ai) {
    try {
      console.log('Trying Modern API...');
      const session = await window.ai.languageModel.create({
        temperature: 0.8,
        topK: 3
      });
      console.log('✅ Modern API session created successfully!');
      
      // Test prompt
      const response = await session.prompt('Say hello!');
      console.log('✅ Response:', response);
      
      session.destroy();
      return;
    } catch (e) {
      console.log('❌ Modern API failed:', e.message);
    }
  }
  
  // Try Legacy API
  if (typeof LanguageModel !== 'undefined') {
    try {
      console.log('Trying Legacy API...');
      const session = await LanguageModel.create({
        temperature: 0.8,
        topK: 3,
        outputLanguage: 'en'
      });
      console.log('✅ Legacy API session created successfully!');
      
      // Test prompt
      const response = await session.prompt('Say hello!');
      console.log('✅ Response:', response);
      
      session.destroy();
      return;
    } catch (e) {
      console.log('❌ Legacy API failed:', e.message);
    }
  }
  
  console.log('❌ No working AI API found!');
})();
```

---

## 📊 **Expected Results**

### **If You Have Modern APIs:**
```
✅ ai object: EXISTS
✅ languageModel: EXISTS
✅ summarizer: EXISTS
✅ Modern Prompt API status: readily
✅ Summarizer API status: readily
```

### **If You Have Legacy API (You!):**
```
❌ ai object: NOT FOUND
❌ Modern APIs: NOT FOUND
✅ LanguageModel (legacy): EXISTS
✅ Legacy LanguageModel status: readily
```

### **If Nothing Works:**
```
❌ All APIs: NOT FOUND
👉 Enable Chrome flags and restart!
```

---

## 🔧 **Quick Copy-Paste for Your Case**

Since you have **Legacy LanguageModel**, run this:

```javascript
// Quick test for YOUR system
(async () => {
  if (typeof LanguageModel !== 'undefined') {
    const status = await LanguageModel.availability();
    console.log('✅ YOU HAVE: Legacy LanguageModel');
    console.log('📊 Status:', status);
    
    if (status === 'readily' || status === 'available') {
      console.log('🎉 READY TO USE!');
      
      // Create a test session
      const session = await LanguageModel.create({
        temperature: 0.7,
        topK: 3,
        outputLanguage: 'en'
      });
      
      const response = await session.prompt('Hello! Can you respond?');
      console.log('✅ Test Response:', response);
      session.destroy();
    }
  } else {
    console.log('❌ No LanguageModel found');
  }
})();
```

---

## 🎯 **What to Look For**

### **Good Signs ✅:**
- `available: "readily"` or `"available"`
- Session creates successfully
- You get a real response

### **Bad Signs ❌:**
- `available: "no"`
- Errors about "not enabled"
- `undefined` for all APIs

---

## 💡 **Pro Tip**

Save this as a **Console Snippet** in Chrome:
1. DevTools → Sources → Snippets
2. Create new snippet
3. Paste the "FULL STATUS CHECK" command
4. Run anytime with Ctrl+Enter!

---

**Run these in your browser console NOW to see what you have!** 🚀

