// ═══════════════════════════════════════════════════════════════
// Chrome AI Auto-Fix Console Script
// Paste this entire script into Chrome DevTools Console
// ═══════════════════════════════════════════════════════════════

(async function chromeAIAutoFix() {
  console.clear();
  console.log('%c═══════════════════════════════════════', 'color: #11998e; font-weight: bold');
  console.log('%c   🔧 CHROME AI AUTO-FIX SCRIPT', 'color: #11998e; font-weight: bold; font-size: 16px');
  console.log('%c═══════════════════════════════════════\n', 'color: #11998e; font-weight: bold');
  
  // Check 1: Chrome Version
  console.log('%c📋 Check 1: Chrome Version', 'color: #667eea; font-weight: bold');
  const userAgent = navigator.userAgent;
  const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
  if (chromeMatch) {
    const version = parseInt(chromeMatch[1]);
    if (version >= 127) {
      console.log(`   ✅ Chrome ${chromeMatch[1]} (OK)`);
    } else {
      console.log(`   ❌ Chrome ${chromeMatch[1]} (Too old - need 127+)`);
    }
  }
  
  // Check 2: Origin Trial Token
  console.log('\n%c📋 Check 2: Origin Trial Token', 'color: #667eea; font-weight: bold');
  const hasToken = document.querySelector('meta[http-equiv="origin-trial"]');
  if (hasToken) {
    console.log('   ✅ Token present (length:', hasToken.content.length, 'chars)');
  } else {
    console.log('   ❌ Token missing');
  }
  
  // Check 3: Modern APIs
  console.log('\n%c📋 Check 3: Modern APIs', 'color: #667eea; font-weight: bold');
  
  if ('ai' in window) {
    console.log('   ✅ window.ai: EXISTS');
    
    // Check each API
    const apis = ['languageModel', 'summarizer', 'translator', 'writer', 'rewriter'];
    for (const api of apis) {
      if (api in window.ai) {
        console.log(`   ✅ window.ai.${api}: EXISTS`);
        try {
          const caps = await window.ai[api].capabilities();
          console.log(`      📊 Status: ${caps.available}`);
        } catch (e) {
          console.log(`      ⚠️  Error checking: ${e.message}`);
        }
      } else {
        console.log(`   ❌ window.ai.${api}: NOT FOUND`);
      }
    }
  } else {
    console.log('   ❌ window.ai: NOT FOUND');
  }
  
  // Check 4: Legacy API
  console.log('\n%c📋 Check 4: Legacy API', 'color: #667eea; font-weight: bold');
  if (typeof LanguageModel !== 'undefined') {
    console.log('   ✅ LanguageModel: EXISTS');
    try {
      const status = await LanguageModel.availability();
      console.log(`   📊 Status: ${status}`);
      
      if (status === 'readily' || status === 'available') {
        console.log('   🎉 READY TO USE!');
      }
    } catch (e) {
      console.log(`   ❌ Error: ${e.message}`);
    }
  } else {
    console.log('   ❌ LanguageModel: NOT FOUND');
  }
  
  // Check 5: Translation API
  console.log('\n%c📋 Check 5: Translation API', 'color: #667eea; font-weight: bold');
  if ('translation' in self) {
    console.log('   ✅ self.translation: EXISTS');
    try {
      const canTranslate = await translation.canTranslate({
        sourceLanguage: 'en',
        targetLanguage: 'es'
      });
      console.log(`   📊 Can translate (en→es): ${canTranslate}`);
    } catch (e) {
      console.log(`   ⚠️  Error: ${e.message}`);
    }
  } else {
    console.log('   ❌ self.translation: NOT FOUND');
  }
  
  // Diagnosis
  console.log('\n%c═══════════════════════════════════════', 'color: #11998e; font-weight: bold');
  console.log('%c🎯 DIAGNOSIS & FIXES', 'color: #11998e; font-weight: bold; font-size: 14px');
  console.log('%c═══════════════════════════════════════', 'color: #11998e; font-weight: bold');
  
  const hasModern = 'ai' in window;
  const hasLegacy = typeof LanguageModel !== 'undefined';
  
  if (!hasModern && !hasLegacy) {
    console.log('\n%c❌ NO AI APIs AVAILABLE', 'color: #f5576c; font-weight: bold; font-size: 16px');
    console.log('\n🔧 REQUIRED FIXES:');
    console.log('\n1. Enable Chrome flags (CRITICAL):');
    console.log('   Copy and paste each URL in new tab:');
    console.log('   - chrome://flags/#optimization-guide-on-device-model');
    console.log('   - chrome://flags/#prompt-api-for-gemini-nano');
    console.log('   - chrome://flags/#summarization-api-for-gemini-nano');
    console.log('\n2. Set EACH to: "Enabled BypassPerfRequirement"');
    console.log('\n3. Click "Relaunch" button at bottom');
    console.log('\n4. Wait 5-10 minutes after restart');
    console.log('\n5. Run this script again');
    
  } else if (!hasModern && hasLegacy) {
    console.log('\n%c✅ LEGACY API WORKING!', 'color: #38ef7d; font-weight: bold; font-size: 16px');
    console.log('\n🎉 You can use all experiments right now!');
    console.log('   - Click any experiment');
    console.log('   - Select "⚡ Legacy API" button');
    console.log('   - Start using AI!\n');
    
    console.log('%c⚠️  OPTIONAL: Enable Modern APIs for Better Performance', 'color: #f5a623; font-weight: bold');
    console.log('\n🔧 To enable Modern APIs (Optional):');
    console.log('\n1. Enable these Chrome flags:');
    console.log('   - chrome://flags/#optimization-guide-on-device-model');
    console.log('   - chrome://flags/#prompt-api-for-gemini-nano');
    console.log('   - chrome://flags/#summarization-api-for-gemini-nano');
    console.log('   - chrome://flags/#translation-api');
    console.log('   - chrome://flags/#writer-api');
    console.log('   - chrome://flags/#rewriter-api');
    console.log('\n2. Set to: "Enabled" or "Enabled BypassPerfRequirement"');
    console.log('\n3. Restart Chrome, wait 10 minutes');
    console.log('\n4. Check status: chrome://on-device-internals');
    
  } else {
    console.log('\n%c🎉 ALL SYSTEMS GO!', 'color: #38ef7d; font-weight: bold; font-size: 18px');
    console.log('\n✅ Modern APIs: Available');
    if (hasLegacy) console.log('✅ Legacy API: Available (backup)');
    console.log('\n🚀 You can use all features!');
  }
  
  // Quick test
  console.log('\n%c═══════════════════════════════════════', 'color: #11998e; font-weight: bold');
  console.log('%c🧪 QUICK TEST', 'color: #11998e; font-weight: bold; font-size: 14px');
  console.log('%c═══════════════════════════════════════', 'color: #11998e; font-weight: bold');
  
  if (hasLegacy) {
    console.log('\n🔬 Testing Legacy API...');
    try {
      const session = await LanguageModel.create({
        temperature: 0.7,
        topK: 3,
        outputLanguage: 'en'
      });
      console.log('✅ Session created!');
      
      const response = await session.prompt('Say "Hello from Chrome AI!" in one sentence.');
      console.log(`\n💬 AI Response:\n   "${response}"\n`);
      
      session.destroy();
      console.log('✅ Test complete!');
    } catch (e) {
      console.log(`❌ Test failed: ${e.message}`);
    }
  }
  
  console.log('\n%c═══════════════════════════════════════', 'color: #11998e; font-weight: bold');
  console.log('%c✅ Auto-Fix Script Complete!', 'color: #11998e; font-weight: bold; font-size: 14px');
  console.log('%c═══════════════════════════════════════\n', 'color: #11998e; font-weight: bold');
  
})();

