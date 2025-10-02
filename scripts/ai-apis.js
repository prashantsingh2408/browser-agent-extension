// Chrome Built-in AI Task APIs
// Enhanced AI capabilities using Chrome's specialized models

// Check API availability - Enhanced with capability checks
async function checkAIAPIs() {
  const apis = {
    // Modern APIs
    languageModel: {
      exists: !!(window.ai?.languageModel),
      available: false,
      status: 'checking...'
    },
    
    // Task-specific APIs
    summarizer: {
      exists: 'ai' in self && 'summarizer' in self.ai,
      available: false,
      status: 'checking...'
    },
    translator: {
      exists: 'translation' in self,
      available: false,
      status: 'checking...'
    },
    writer: {
      exists: 'ai' in self && 'writer' in self.ai,
      available: false,
      status: 'checking...'
    },
    rewriter: {
      exists: 'ai' in self && 'rewriter' in self.ai,
      available: false,
      status: 'checking...'
    },
    languageDetector: {
      exists: 'ai' in self && 'languageDetector' in self.ai,
      available: false,
      status: 'checking...'
    },
    prompt: {
      exists: 'ai' in self && 'prompt' in self.ai,
      available: false,
      status: 'checking...'
    },
    
    // Legacy APIs
    createTextSession: {
      exists: !!(window.ai?.createTextSession),
      available: !!(window.ai?.createTextSession),
      status: window.ai?.createTextSession ? 'readily' : 'no'
    },
    globalLanguageModel: {
      exists: typeof LanguageModel !== 'undefined',
      available: typeof LanguageModel !== 'undefined',
      status: typeof LanguageModel !== 'undefined' ? 'readily' : 'no'
    }
  };
  
  console.log('Available AI APIs:', apis);
  return apis;
}

// 1. SUMMARIZER API - Better than generic prompt for summaries
async function createSummarizer() {
  try {
    if (!('ai' in self) || !('summarizer' in self.ai)) {
      throw new Error('Summarizer API not available');
    }
    
    const canSummarize = await self.ai.summarizer.capabilities();
    if (canSummarize.available === 'no') {
      throw new Error('Summarizer not available on this device');
    }
    
    // Wait for model download if needed
    if (canSummarize.available === 'after-download') {
      console.log('Downloading summarizer model...');
    }
    
    const summarizer = await self.ai.summarizer.create({
      type: 'key-points',  // or 'tl;dr', 'teaser', 'headline'
      format: 'markdown',
      length: 'medium'     // 'short', 'medium', 'long'
    });
    
    return summarizer;
  } catch (error) {
    console.error('Summarizer creation failed:', error);
    return null;
  }
}

// 2. TRANSLATOR API - Native translation (Currently in development)
async function createTranslator(targetLanguage = 'es') {
  try {
    // Check if the translation API exists
    if (!('translation' in self)) {
      console.log('Translator API not yet available in this Chrome version');
      return null;
    }
    
    const canTranslate = await self.translation.canTranslate({
      sourceLanguage: 'en',
      targetLanguage: targetLanguage
    });
    
    if (canTranslate === 'no') {
      console.log(`Cannot translate to ${targetLanguage} - model not available`);
      return null;
    }
    
    if (canTranslate === 'after-download') {
      console.log('Downloading translation model...');
    }
    
    const translator = await self.translation.createTranslator({
      sourceLanguage: 'en',
      targetLanguage: targetLanguage
    });
    
    return translator;
  } catch (error) {
    console.log('Translator API not ready:', error.message);
    return null;
  }
}

// 3. WRITER API - Content generation
async function createWriter() {
  try {
    if (!('ai' in self) || !('writer' in self.ai)) {
      throw new Error('Writer API not available');
    }
    
    const canWrite = await self.ai.writer.capabilities();
    if (canWrite.available === 'no') {
      throw new Error('Writer not available');
    }
    
    const writer = await self.ai.writer.create({
      tone: 'professional',  // 'casual', 'formal'
      format: 'paragraph',
      length: 'medium'
    });
    
    return writer;
  } catch (error) {
    console.error('Writer creation failed:', error);
    return null;
  }
}

// 4. REWRITER API - Text improvement
async function createRewriter() {
  try {
    if (!('ai' in self) || !('rewriter' in self.ai)) {
      throw new Error('Rewriter API not available');
    }
    
    const canRewrite = await self.ai.rewriter.capabilities();
    if (canRewrite.available === 'no') {
      throw new Error('Rewriter not available');
    }
    
    const rewriter = await self.ai.rewriter.create({
      tone: 'as-is',
      format: 'as-is',
      length: 'as-is'
    });
    
    return rewriter;
  } catch (error) {
    console.error('Rewriter creation failed:', error);
    return null;
  }
}

// 5. LANGUAGE DETECTOR API
async function detectLanguage(text) {
  try {
    if (!('ai' in self) || !('languageDetector' in self.ai)) {
      throw new Error('Language Detector API not available');
    }
    
    const canDetect = await self.ai.languageDetector.capabilities();
    if (canDetect.available === 'no') {
      throw new Error('Language Detector not available');
    }
    
    const detector = await self.ai.languageDetector.create();
    const results = await detector.detect(text);
    
    // Returns array of { language: 'en', confidence: 0.95 }
    return results;
  } catch (error) {
    console.error('Language detection failed:', error);
    return null;
  }
}

// 6. PROMPT API - Enhanced Gemini Nano access with modern fallbacks
async function createPromptSession(options = {}) {
  const defaultOptions = {
    systemPrompt: 'You are a helpful assistant that analyzes web content.',
    temperature: 0.7,
    topK: 3,
    ...options
  };

  try {
    // TIER 1: Try modern window.ai.languageModel (Chrome 127+)
    if (window.ai?.languageModel) {
      console.log('🎯 Using window.ai.languageModel (Chrome Built-in AI)');
      const capabilities = await window.ai.languageModel.capabilities();
      
      if (capabilities.available === 'no') {
        console.warn('⚠️ Language Model not available on this device');
      } else {
        if (capabilities.available === 'after-download') {
          console.log('📥 Downloading AI model... This may take a moment.');
        }
        
        const session = await window.ai.languageModel.create({
          systemPrompt: defaultOptions.systemPrompt,
          temperature: defaultOptions.temperature,
          topK: defaultOptions.topK
        });
        
        console.log('✅ Prompt session created with window.ai.languageModel');
        return session;
      }
    }
    
    // TIER 2: Try self.ai.prompt (experimental API)
    if (self.ai?.prompt) {
      console.log('🎯 Trying self.ai.prompt (Experimental Prompt API)');
      const canPrompt = await self.ai.prompt.capabilities();
      
      if (canPrompt.available === 'no') {
        console.warn('⚠️ Prompt API not available');
      } else {
        if (canPrompt.available === 'after-download') {
          console.log('📥 Downloading Prompt API model...');
        }
        
        const session = await self.ai.prompt.create(defaultOptions);
        console.log('✅ Prompt session created with self.ai.prompt');
        return session;
      }
    }
    
    // TIER 3: Try legacy window.ai.createTextSession
    if (window.ai?.createTextSession) {
      console.log('🎯 Using legacy window.ai.createTextSession');
      const session = await window.ai.createTextSession();
      console.log('✅ Legacy text session created');
      return session;
    }
    
    // TIER 4: Try legacy LanguageModel global
    if (typeof LanguageModel !== 'undefined') {
      console.log('🎯 Using global LanguageModel API');
      const session = await LanguageModel.create({
        temperature: defaultOptions.temperature,
        topK: defaultOptions.topK
      });
      console.log('✅ Global LanguageModel session created');
      return session;
    }
    
    throw new Error('No AI model available - enable Chrome AI in chrome://flags');
  } catch (error) {
    console.error('❌ All prompt session creation attempts failed:', error);
    console.log('💡 To enable Chrome AI:');
    console.log('   1. Go to chrome://flags');
    console.log('   2. Enable "Optimization Guide On Device Model"');
    console.log('   3. Set to "Enabled BypassPerfRequirement"');
    console.log('   4. Restart Chrome');
    return null;
  }
}

// Check which Prompt APIs are available
async function checkPromptAPIAvailability() {
  const status = {
    'window.ai.languageModel': false,
    'self.ai.prompt': false,
    'window.ai.createTextSession': false,
    'global LanguageModel': false,
    recommended: null,
    capabilities: {}
  };
  
  // Check window.ai.languageModel (modern API)
  if (window.ai?.languageModel) {
    try {
      const caps = await window.ai.languageModel.capabilities();
      status['window.ai.languageModel'] = caps.available !== 'no';
      status.capabilities.languageModel = caps;
      if (caps.available === 'readily') {
        status.recommended = 'window.ai.languageModel';
      }
    } catch (e) {
      console.warn('window.ai.languageModel check failed:', e);
    }
  }
  
  // Check self.ai.prompt (experimental)
  if (self.ai?.prompt) {
    try {
      const caps = await self.ai.prompt.capabilities();
      status['self.ai.prompt'] = caps.available !== 'no';
      status.capabilities.prompt = caps;
      if (!status.recommended && caps.available === 'readily') {
        status.recommended = 'self.ai.prompt';
      }
    } catch (e) {
      console.warn('self.ai.prompt check failed:', e);
    }
  }
  
  // Check legacy APIs
  status['window.ai.createTextSession'] = typeof window.ai?.createTextSession === 'function';
  status['global LanguageModel'] = typeof LanguageModel !== 'undefined';
  
  if (!status.recommended) {
    if (status['window.ai.createTextSession']) {
      status.recommended = 'window.ai.createTextSession';
    } else if (status['global LanguageModel']) {
      status.recommended = 'global LanguageModel';
    }
  }
  
  return status;
}

// TEST MODE - Comprehensive API Testing
async function testAllAIAPIs(verbose = true) {
  const testResults = {
    timestamp: new Date().toISOString(),
    browser: navigator.userAgent,
    chromeVersion: navigator.userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown',
    tests: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    }
  };

  if (verbose) {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('🧪 CHROME AI APIs - COMPREHENSIVE TEST MODE');
    console.log('═══════════════════════════════════════════════════\n');
    console.log(`Chrome Version: ${testResults.chromeVersion}`);
    console.log(`Test Time: ${new Date().toLocaleString()}\n`);
  }

  // Test 1: Language Model API (window.ai.languageModel)
  testResults.tests.languageModel = await testLanguageModel(verbose);
  
  // Test 2: Prompt API (self.ai.prompt)
  testResults.tests.promptAPI = await testPromptAPI(verbose);
  
  // Test 3: Summarizer API
  testResults.tests.summarizer = await testSummarizerAPI(verbose);
  
  // Test 4: Writer API
  testResults.tests.writer = await testWriterAPI(verbose);
  
  // Test 5: Rewriter API
  testResults.tests.rewriter = await testRewriterAPI(verbose);
  
  // Test 6: Translator API
  testResults.tests.translator = await testTranslatorAPI(verbose);
  
  // Test 7: Language Detector API
  testResults.tests.languageDetector = await testLanguageDetectorAPI(verbose);
  
  // Test 8: Legacy APIs
  testResults.tests.legacy = await testLegacyAPIs(verbose);

  // Calculate summary
  for (const [name, result] of Object.entries(testResults.tests)) {
    testResults.summary.total += result.passed + result.failed + result.skipped;
    testResults.summary.passed += result.passed;
    testResults.summary.failed += result.failed;
    testResults.summary.skipped += result.skipped;
  }

  // Print summary
  if (verbose) {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('📊 TEST SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log(`✅ Passed:  ${testResults.summary.passed}`);
    console.log(`❌ Failed:  ${testResults.summary.failed}`);
    console.log(`⏭️  Skipped: ${testResults.summary.skipped}`);
    console.log(`📝 Total:   ${testResults.summary.total}`);
    console.log('═══════════════════════════════════════════════════\n');

    // Recommendations
    if (testResults.summary.failed > 0) {
      console.log('💡 RECOMMENDATIONS:');
      if (!testResults.tests.languageModel.details.exists) {
        console.log('   • Enable Chrome AI in chrome://flags');
        console.log('   • Search for "Optimization Guide On Device Model"');
        console.log('   • Set to "Enabled BypassPerfRequirement"');
        console.log('   • Restart Chrome');
      }
      console.log('\n');
    }
  }

  return testResults;
}

// Individual API Test Functions
async function testLanguageModel(verbose) {
  const result = { name: 'Language Model API', passed: 0, failed: 0, skipped: 0, details: {} };
  
  if (verbose) console.log('🔍 Testing Language Model API (window.ai.languageModel)...');
  
  try {
    // Check existence
    result.details.exists = !!(window.ai?.languageModel);
    if (!result.details.exists) {
      if (verbose) console.log('   ❌ API not found');
      result.failed++;
      return result;
    }
    if (verbose) console.log('   ✅ API exists');
    result.passed++;
    
    // Check capabilities
    const capabilities = await window.ai.languageModel.capabilities();
    result.details.capabilities = capabilities;
    result.details.available = capabilities.available;
    
    if (capabilities.available === 'no') {
      if (verbose) console.log('   ❌ API not available');
      result.failed++;
      return result;
    }
    if (verbose) console.log(`   ✅ API available (${capabilities.available})`);
    result.passed++;
    
    // Try creating a session
    if (capabilities.available === 'readily') {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a test assistant.',
        temperature: 0.7
      });
      if (verbose) console.log('   ✅ Session created successfully');
      result.passed++;
      
      // Try a simple prompt
      const response = await session.prompt('Say "test successful" in 2 words.');
      result.details.testResponse = response.substring(0, 100);
      if (verbose) console.log(`   ✅ Prompt test passed: "${response.substring(0, 50)}..."`);
      result.passed++;
      
      session.destroy();
      if (verbose) console.log('   ✅ Session destroyed successfully\n');
      result.passed++;
    } else {
      if (verbose) console.log('   ⏭️  Skipped live test (model needs download)\n');
      result.skipped += 3;
    }
    
  } catch (error) {
    if (verbose) console.log(`   ❌ Error: ${error.message}\n`);
    result.details.error = error.message;
    result.failed++;
  }
  
  return result;
}

async function testPromptAPI(verbose) {
  const result = { name: 'Prompt API', passed: 0, failed: 0, skipped: 0, details: {} };
  
  if (verbose) console.log('🔍 Testing Prompt API (self.ai.prompt)...');
  
  try {
    result.details.exists = !!(self.ai?.prompt);
    if (!result.details.exists) {
      if (verbose) console.log('   ⏭️  API not found (experimental feature)\n');
      result.skipped++;
      return result;
    }
    if (verbose) console.log('   ✅ API exists');
    result.passed++;
    
    const capabilities = await self.ai.prompt.capabilities();
    result.details.capabilities = capabilities;
    
    if (capabilities.available === 'readily') {
      if (verbose) console.log('   ✅ API available and ready\n');
      result.passed++;
    } else {
      if (verbose) console.log(`   ⚠️  API status: ${capabilities.available}\n`);
      result.skipped++;
    }
    
  } catch (error) {
    if (verbose) console.log(`   ❌ Error: ${error.message}\n`);
    result.details.error = error.message;
    result.failed++;
  }
  
  return result;
}

async function testSummarizerAPI(verbose) {
  const result = { name: 'Summarizer API', passed: 0, failed: 0, skipped: 0, details: {} };
  
  if (verbose) console.log('🔍 Testing Summarizer API (self.ai.summarizer)...');
  
  try {
    result.details.exists = !!(self.ai?.summarizer);
    if (!result.details.exists) {
      if (verbose) console.log('   ⏭️  API not found\n');
      result.skipped++;
      return result;
    }
    
    const capabilities = await self.ai.summarizer.capabilities();
    result.details.capabilities = capabilities;
    
    if (capabilities.available === 'readily') {
      const summarizer = await self.ai.summarizer.create();
      const testText = 'Chrome Built-in AI brings powerful machine learning models directly to the browser. This allows developers to create AI-powered applications that run entirely on the user\'s device, ensuring privacy and fast response times.';
      const summary = await summarizer.summarize(testText);
      result.details.testSummary = summary;
      if (verbose) console.log(`   ✅ Summarization successful: "${summary.substring(0, 60)}..."\n`);
      result.passed += 2;
    } else {
      if (verbose) console.log(`   ⚠️  API status: ${capabilities.available}\n`);
      result.skipped++;
    }
    
  } catch (error) {
    if (verbose) console.log(`   ⏭️  ${error.message}\n`);
    result.details.error = error.message;
    result.skipped++;
  }
  
  return result;
}

async function testWriterAPI(verbose) {
  const result = { name: 'Writer API', passed: 0, failed: 0, skipped: 0, details: {} };
  
  if (verbose) console.log('🔍 Testing Writer API (self.ai.writer)...');
  
  try {
    result.details.exists = !!(self.ai?.writer);
    if (!result.details.exists) {
      if (verbose) console.log('   ⏭️  API not found\n');
      result.skipped++;
      return result;
    }
    
    const capabilities = await self.ai.writer.capabilities();
    result.details.capabilities = capabilities;
    
    if (verbose) console.log(`   ℹ️  API status: ${capabilities.available}\n`);
    result.skipped++;
    
  } catch (error) {
    if (verbose) console.log(`   ⏭️  ${error.message}\n`);
    result.skipped++;
  }
  
  return result;
}

async function testRewriterAPI(verbose) {
  const result = { name: 'Rewriter API', passed: 0, failed: 0, skipped: 0, details: {} };
  
  if (verbose) console.log('🔍 Testing Rewriter API (self.ai.rewriter)...');
  
  try {
    result.details.exists = !!(self.ai?.rewriter);
    if (!result.details.exists) {
      if (verbose) console.log('   ⏭️  API not found\n');
      result.skipped++;
      return result;
    }
    
    const capabilities = await self.ai.rewriter.capabilities();
    result.details.capabilities = capabilities;
    
    if (verbose) console.log(`   ℹ️  API status: ${capabilities.available}\n`);
    result.skipped++;
    
  } catch (error) {
    if (verbose) console.log(`   ⏭️  ${error.message}\n`);
    result.skipped++;
  }
  
  return result;
}

async function testTranslatorAPI(verbose) {
  const result = { name: 'Translator API', passed: 0, failed: 0, skipped: 0, details: {} };
  
  if (verbose) console.log('🔍 Testing Translator API (self.translation)...');
  
  try {
    result.details.exists = !!self.translation;
    if (!result.details.exists) {
      if (verbose) console.log('   ⏭️  API not found (in development)\n');
      result.skipped++;
      return result;
    }
    
    if (verbose) console.log('   ✅ API exists (rare!)\n');
    result.passed++;
    
  } catch (error) {
    if (verbose) console.log(`   ⏭️  ${error.message}\n`);
    result.skipped++;
  }
  
  return result;
}

async function testLanguageDetectorAPI(verbose) {
  const result = { name: 'Language Detector API', passed: 0, failed: 0, skipped: 0, details: {} };
  
  if (verbose) console.log('🔍 Testing Language Detector API (self.ai.languageDetector)...');
  
  try {
    result.details.exists = !!(self.ai?.languageDetector);
    if (!result.details.exists) {
      if (verbose) console.log('   ⏭️  API not found\n');
      result.skipped++;
      return result;
    }
    
    if (verbose) console.log('   ✅ API exists\n');
    result.passed++;
    
  } catch (error) {
    if (verbose) console.log(`   ⏭️  ${error.message}\n`);
    result.skipped++;
  }
  
  return result;
}

async function testLegacyAPIs(verbose) {
  const result = { name: 'Legacy APIs', passed: 0, failed: 0, skipped: 0, details: {} };
  
  if (verbose) console.log('🔍 Testing Legacy APIs...');
  
  // Check window.ai.createTextSession
  result.details.createTextSession = !!(window.ai?.createTextSession);
  if (result.details.createTextSession) {
    if (verbose) console.log('   ✅ window.ai.createTextSession exists');
    result.passed++;
  } else {
    if (verbose) console.log('   ⏭️  window.ai.createTextSession not found');
    result.skipped++;
  }
  
  // Check global LanguageModel
  result.details.globalLanguageModel = typeof LanguageModel !== 'undefined';
  if (result.details.globalLanguageModel) {
    if (verbose) console.log('   ✅ Global LanguageModel exists');
    result.passed++;
  } else {
    if (verbose) console.log('   ⏭️  Global LanguageModel not found');
    result.skipped++;
  }
  
  if (verbose) console.log('');
  
  return result;
}

// Quick test - just checks availability without detailed tests
async function quickTestAIAPIs() {
  console.log('🚀 Quick AI API Check...\n');
  
  const checks = {
    '✅ Recommended': !!(window.ai?.languageModel) ? 'window.ai.languageModel' : null,
    '🔬 Experimental': !!(self.ai?.prompt) ? 'self.ai.prompt' : null,
    '📝 Task APIs': [],
    '🔧 Legacy': []
  };
  
  if (self.ai?.summarizer) checks['📝 Task APIs'].push('summarizer');
  if (self.ai?.writer) checks['📝 Task APIs'].push('writer');
  if (self.ai?.rewriter) checks['📝 Task APIs'].push('rewriter');
  if (self.translation) checks['📝 Task APIs'].push('translator');
  
  if (window.ai?.createTextSession) checks['🔧 Legacy'].push('createTextSession');
  if (typeof LanguageModel !== 'undefined') checks['🔧 Legacy'].push('LanguageModel');
  
  console.table(checks);
  
  if (!checks['✅ Recommended']) {
    console.log('\n⚠️  Chrome AI not detected!');
    console.log('Enable in chrome://flags → "Optimization Guide On Device Model"');
  } else {
    console.log('\n✅ Chrome AI is ready!');
  }
  
  return checks;
}

// Usage Examples for Quick Actions

// Enhanced Summarize using Summarizer API
async function smartSummarize(content) {
  const summarizer = await createSummarizer();
  if (summarizer) {
    const summary = await summarizer.summarize(content);
    return summary;
  }
  // Fallback to regular prompt
  const session = await createPromptSession();
  return await session.prompt(`Summarize this: ${content}`);
}

// Translate content
async function translateContent(content, targetLang) {
  const translator = await createTranslator(targetLang);
  if (translator) {
    try {
      const translated = await translator.translate(content);
      return translated;
    } catch (error) {
      console.log('Translation failed:', error);
      return null;
    }
  }
  return null; // Return null to indicate API not available
}

// Improve writing
async function improveText(text) {
  const rewriter = await createRewriter();
  if (rewriter) {
    const options = [
      { tone: 'professional' },
      { length: 'shorter' },
      { format: 'bullet-points' }
    ];
    const improved = await rewriter.rewrite(text, options[0]);
    return improved;
  }
  return text;
}

// Stream responses for better UX
async function* streamResponse(session, prompt) {
  if (session.promptStreaming) {
    const stream = session.promptStreaming(prompt);
    for await (const chunk of stream) {
      yield chunk;
    }
  } else {
    // Fallback to non-streaming
    yield await session.prompt(prompt);
  }
}

// Export for use in extension
window.chromeAI = {
  // API Checking
  checkAIAPIs,
  checkPromptAPIAvailability,
  
  // Test Functions
  testAllAIAPIs,
  quickTestAIAPIs,
  
  // API Creators
  createSummarizer,
  createTranslator,
  createWriter,
  createRewriter,
  detectLanguage,
  createPromptSession,
  
  // Usage Helpers
  smartSummarize,
  translateContent,
  improveText,
  streamResponse
};
