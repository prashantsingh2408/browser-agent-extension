// Smart Features Module - Advanced Prompt API Use Cases
// Uses Chrome's built-in AI for practical features

class SmartFeatures {
  constructor() {
    this.session = null;
    this.sessionCache = new Map();
  }

  // ============================================
  // 1. SMART IMAGE ANALYZER
  // ============================================
  
  /**
   * Analyze an image and provide description
   * Use case: Accessibility, image search, content moderation
   */
  async analyzeImage(imageUrl, analysisType = 'description') {
    try {
      // Check if multimodal is available
      const availability = await LanguageModel.availability({ language: 'en' });
      if (availability === 'unavailable') {
        throw new Error('AI model not available');
      }

      // Fetch and convert image
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const imageBitmap = await createImageBitmap(blob);

      // Create session for image analysis
      const session = await LanguageModel.create({
        expectedInputs: [{ type: 'image' }],
        temperature: 0.3,  // Lower for factual descriptions
        language: 'en'
      });

      const prompts = {
        description: 'Describe this image in detail. Include objects, colors, setting, and mood.',
        accessibility: 'Provide a concise alt text description for accessibility (30 words max). Use object-action-context framework.',
        objects: 'List all objects visible in this image.',
        text: 'Extract and transcribe any text found in this image.',
        sentiment: 'Describe the mood and emotional tone of this image.',
        content_safety: 'Analyze if this image contains inappropriate, violent, or sensitive content. Answer yes/no and explain briefly.'
      };

      const result = await session.prompt([{
        role: 'user',
        content: [
          { type: 'text', value: prompts[analysisType] },
          { type: 'image', value: imageBitmap }
        ]
      }], { language: 'en' });

      session.destroy();
      return result;

    } catch (error) {
      console.error('Image analysis failed:', error);
      return `Error: ${error.message}`;
    }
  }

  // ============================================
  // 2. STRUCTURED DATA EXTRACTOR
  // ============================================
  
  /**
   * Extract structured data from text/HTML
   * Use case: Product comparison, contact extraction, event parsing
   */
  async extractStructuredData(content, dataType = 'contact') {
    try {
      const session = await this.getOrCreateSession('extraction');

      const schemas = {
        contact: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            address: { type: 'string' },
            company: { type: 'string' }
          }
        },
        product: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            price: { type: 'number' },
            currency: { type: 'string' },
            rating: { type: 'number' },
            features: { type: 'array', items: { type: 'string' } },
            inStock: { type: 'boolean' }
          }
        },
        event: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            date: { type: 'string' },
            time: { type: 'string' },
            location: { type: 'string' },
            description: { type: 'string' }
          }
        },
        recipe: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            servings: { type: 'number' },
            prepTime: { type: 'string' },
            ingredients: { type: 'array', items: { type: 'string' } },
            instructions: { type: 'array', items: { type: 'string' } }
          }
        }
      };

      const schema = schemas[dataType];
      
      const result = await session.prompt(`
        Extract ${dataType} information from this content:
        
        ${content}
        
        Return as valid JSON matching this structure:
        ${JSON.stringify(schema, null, 2)}
        
        Only return the JSON, no other text.
      `);

      return JSON.parse(result);

    } catch (error) {
      console.error('Data extraction failed:', error);
      return null;
    }
  }

  // ============================================
  // 3. SMART TEXT REWRITER
  // ============================================
  
  /**
   * Rewrite text in different styles
   * Use case: Email composition, social media, content creation
   */
  async rewriteText(text, style = 'professional') {
    try {
      const session = await this.getOrCreateSession('rewriter');

      const stylePrompts = {
        professional: 'Rewrite in professional business style. Formal, clear, respectful.',
        casual: 'Rewrite in friendly, casual, conversational style.',
        concise: 'Make this more concise. Remove unnecessary words. Keep key meaning.',
        detailed: 'Expand this with more detail and explanation.',
        simple: 'Simplify using basic language. Explain complex terms.',
        formal: 'Rewrite in formal academic style. Use proper grammar and structure.',
        creative: 'Rewrite creatively. Add flair and personality.',
        persuasive: 'Rewrite to be more persuasive and compelling.',
        technical: 'Rewrite for technical audience. Use precise terminology.',
        eli5: 'Explain like I\'m 5 years old. Very simple, clear explanation.'
      };

      const result = await session.prompt(`
        ${stylePrompts[style]}
        
        Original text:
        ${text}
      `);

      return result.trim();

    } catch (error) {
      console.error('Text rewriting failed:', error);
      return text;
    }
  }

  // ============================================
  // 4. PAGE Q&A SYSTEM
  // ============================================
  
  /**
   * Answer questions about page content
   * Use case: Research, studying, fact-finding
   */
  async answerPageQuestion(question, pageContent) {
    try {
      const session = await this.getOrCreateSession('qa');

      // Limit content to avoid token limits
      const truncatedContent = pageContent.substring(0, 5000);

      const result = await session.prompt(`
        Based on this webpage content:
        
        ${truncatedContent}
        
        Question: ${question}
        
        Provide a concise, accurate answer based only on the content above.
        If the answer is not in the content, say "I cannot find that information on this page."
      `);

      return result.trim();

    } catch (error) {
      console.error('Q&A failed:', error);
      return 'Unable to answer the question.';
    }
  }

  // ============================================
  // 5. SENTIMENT ANALYZER
  // ============================================
  
  /**
   * Analyze sentiment of text
   * Use case: Review analysis, social media monitoring, feedback
   */
  async analyzeSentiment(text) {
    try {
      const session = await this.getOrCreateSession('sentiment');

      const schema = {
        type: 'object',
        properties: {
          sentiment: { 
            type: 'string', 
            enum: ['positive', 'negative', 'neutral', 'mixed'] 
          },
          confidence: { type: 'number' },
          emotions: { 
            type: 'array', 
            items: { type: 'string' } 
          },
          summary: { type: 'string' }
        }
      };

      const result = await session.prompt(`
        Analyze the sentiment of this text:
        
        "${text}"
        
        Return as JSON:
        {
          "sentiment": "positive/negative/neutral/mixed",
          "confidence": 0-1,
          "emotions": ["emotion1", "emotion2"],
          "summary": "brief explanation"
        }
      `);

      return JSON.parse(result);

    } catch (error) {
      console.error('Sentiment analysis failed:', error);
      return {
        sentiment: 'neutral',
        confidence: 0,
        emotions: [],
        summary: 'Analysis failed'
      };
    }
  }

  // ============================================
  // 6. SMART SUMMARIZER
  // ============================================
  
  /**
   * Smart summarization with different styles
   * Use case: News, articles, research papers
   */
  async summarizeContent(content, summaryType = 'brief') {
    try {
      const session = await this.getOrCreateSession('summarizer');

      const summaryPrompts = {
        brief: 'Summarize in 2-3 sentences. Focus on main points only.',
        bullets: 'Create bullet points of key information. 5-7 points.',
        tldr: 'Create a TL;DR (Too Long; Didn\'t Read) in one sentence.',
        detailed: 'Provide comprehensive summary with all important details.',
        academic: 'Create academic-style summary with introduction, main points, conclusion.',
        executive: 'Create executive summary for business audience. Focus on actionable insights.'
      };

      const result = await session.prompt(`
        ${summaryPrompts[summaryType]}
        
        Content:
        ${content.substring(0, 6000)}
      `);

      return result.trim();

    } catch (error) {
      console.error('Summarization failed:', error);
      return 'Summary unavailable';
    }
  }

  // ============================================
  // 7. CONTENT CATEGORIZER
  // ============================================
  
  /**
   * Categorize content automatically
   * Use case: Bookmarks, articles, research organization
   */
  async categorizeContent(title, content) {
    try {
      const session = await this.getOrCreateSession('categorizer');

      const categories = [
        'Technology',
        'Business',
        'Science',
        'Health',
        'Entertainment',
        'Sports',
        'Politics',
        'Education',
        'Travel',
        'Food',
        'Finance',
        'Fashion',
        'Gaming',
        'News',
        'Other'
      ];

      const result = await session.prompt(`
        Categorize this content into ONE of these categories:
        ${categories.join(', ')}
        
        Title: ${title}
        Content: ${content.substring(0, 500)}
        
        Return ONLY the category name, nothing else.
      `);

      const category = result.trim();
      return categories.includes(category) ? category : 'Other';

    } catch (error) {
      console.error('Categorization failed:', error);
      return 'Other';
    }
  }

  // ============================================
  // 8. KEY POINTS EXTRACTOR
  // ============================================
  
  /**
   * Extract key points from long content
   * Use case: Meeting notes, articles, videos
   */
  async extractKeyPoints(content, numberOfPoints = 5) {
    try {
      const session = await this.getOrCreateSession('keypoints');

      const result = await session.prompt(`
        Extract the ${numberOfPoints} most important key points from this content:
        
        ${content.substring(0, 6000)}
        
        Return as numbered list (1. 2. 3. etc.)
        Each point should be concise (one sentence).
      `);

      // Parse into array
      const points = result
        .split('\n')
        .filter(line => /^\d+\./.test(line.trim()))
        .map(line => line.replace(/^\d+\.\s*/, '').trim());

      return points;

    } catch (error) {
      console.error('Key points extraction failed:', error);
      return [];
    }
  }

  // ============================================
  // 9. SMART TRANSLATION HELPER
  // ============================================
  
  /**
   * Context-aware translation
   * Use case: International communication, content localization
   */
  async translateWithContext(text, targetLanguage, context = '') {
    try {
      const session = await this.getOrCreateSession('translator');

      const result = await session.prompt(`
        Translate to ${targetLanguage}:
        
        Text: "${text}"
        ${context ? `Context: ${context}` : ''}
        
        Provide natural, contextually appropriate translation.
        Consider cultural nuances and idioms.
        Return only the translated text.
      `);

      return result.trim();

    } catch (error) {
      console.error('Translation failed:', error);
      return text;
    }
  }

  // ============================================
  // 10. CODE EXPLAINER
  // ============================================
  
  /**
   * Explain code snippets
   * Use case: Learning, documentation, code review
   */
  async explainCode(code, language = 'javascript') {
    try {
      const session = await this.getOrCreateSession('code');

      const result = await session.prompt(`
        Explain this ${language} code in simple terms:
        
        \`\`\`${language}
        ${code}
        \`\`\`
        
        Provide:
        1. What it does (overview)
        2. How it works (step by step)
        3. Key concepts used
        4. Potential issues or improvements
      `);

      return result;

    } catch (error) {
      console.error('Code explanation failed:', error);
      return 'Unable to explain code';
    }
  }

  // ============================================
  // SESSION MANAGEMENT
  // ============================================
  
  async getOrCreateSession(type, options = {}) {
    if (this.sessionCache.has(type)) {
      return this.sessionCache.get(type);
    }

    const defaultOptions = {
      temperature: 0.7,
      topK: 3,
      language: 'en'
    };

    try {
      const session = await LanguageModel.create({
        ...defaultOptions,
        ...options
      });

      this.sessionCache.set(type, session);
      return session;

    } catch (error) {
      console.error(`Failed to create ${type} session:`, error);
      throw error;
    }
  }

  destroySession(type) {
    if (this.sessionCache.has(type)) {
      this.sessionCache.get(type).destroy();
      this.sessionCache.delete(type);
    }
  }

  destroyAllSessions() {
    for (const [type, session] of this.sessionCache) {
      session.destroy();
    }
    this.sessionCache.clear();
  }
}

// Export for use in extension
window.smartFeatures = new SmartFeatures();

// Also export the class
window.SmartFeatures = SmartFeatures;

