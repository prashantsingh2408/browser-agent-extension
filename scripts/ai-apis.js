// Chrome Built-in AI Task APIs
// Enhanced AI capabilities using Chrome's specialized models

// Check API availability
async function checkAIAPIs() {
  const apis = {
    summarizer: 'ai' in self && 'summarizer' in self.ai,
    translator: 'translation' in self,
    writer: 'ai' in self && 'writer' in self.ai,
    rewriter: 'ai' in self && 'rewriter' in self.ai,
    languageDetector: 'ai' in self && 'languageDetector' in self.ai,
    prompt: 'ai' in self && 'prompt' in self.ai
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

// 6. PROMPT API - Enhanced Gemini Nano access
async function createPromptSession() {
  try {
    if (!('ai' in self) || !('prompt' in self.ai)) {
      // Fallback to LanguageModel if Prompt API not available
      if ('LanguageModel' in self) {
        return await LanguageModel.create({
          temperature: 0.7,
          topK: 3
        });
      }
      throw new Error('No AI model available');
    }
    
    const canPrompt = await self.ai.prompt.capabilities();
    if (canPrompt.available === 'no') {
      throw new Error('Prompt API not available');
    }
    
    const session = await self.ai.prompt.create({
      systemPrompt: 'You are a helpful assistant that analyzes web content.',
      temperature: 0.7,
      topK: 3
    });
    
    return session;
  } catch (error) {
    console.error('Prompt session creation failed:', error);
    return null;
  }
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
  checkAIAPIs,
  createSummarizer,
  createTranslator,
  createWriter,
  createRewriter,
  detectLanguage,
  createPromptSession,
  smartSummarize,
  translateContent,
  improveText,
  streamResponse
};
