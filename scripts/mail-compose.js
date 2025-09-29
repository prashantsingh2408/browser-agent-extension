// Mail Compose Functionality with Chrome AI APIs

// AI API instances
let aiAPIs = {
  writer: null,
  rewriter: null,
  summarizer: null,
  languageModel: null
};

// Initialize AI APIs for mail compose with multi-tier fallback
async function initializeMailAI() {
  let aiAvailable = false;
  const availableAPIs = [];
  const failedAPIs = [];
  const apiAttempts = [];
  
  // Show checking status
  showMailNotification('🔍 Checking available AI systems...', 'info');
  
  try {
    // === TIER 1: Chrome Built-in AI (Gemini Nano) ===
    if (typeof window.ai !== 'undefined' && window.ai !== null) {
      console.log('🔍 Checking Chrome AI APIs...');
      apiAttempts.push('Chrome AI detected');
      
      // Try Language Model API (newest)
      try {
        if (window.ai.languageModel) {
          apiAttempts.push('Testing Chrome Language Model...');
          const capabilities = await window.ai.languageModel.capabilities();
          if (capabilities.available !== 'no') {
            if (capabilities.available === 'after-download') {
              showMailNotification('📥 Downloading Chrome AI model...', 'info');
            }
            const session = await window.ai.languageModel.create({
              systemPrompt: 'You are a professional email assistant. Generate clear, concise, and well-structured emails.'
            });
            aiAPIs.languageModel = session;
            availableAPIs.push('Chrome Language Model');
            aiAvailable = true;
            console.log('✅ Chrome Language Model ready');
          } else {
            failedAPIs.push('Chrome Language Model (not available)');
          }
        }
      } catch (error) {
        failedAPIs.push(`Chrome Language Model (${error.message})`);
        console.warn('❌ Language Model failed:', error);
      }
      
      // Try Gemini Nano Session API
      if (!aiAvailable) {
        try {
          if (window.ai.createTextSession) {
            apiAttempts.push('Testing Gemini Nano...');
            const session = await window.ai.createTextSession();
            aiAPIs.languageModel = {
              prompt: async (text) => await session.prompt(text),
              destroy: () => session.destroy()
            };
            availableAPIs.push('Gemini Nano');
            aiAvailable = true;
            console.log('✅ Gemini Nano session ready');
          }
        } catch (error) {
          failedAPIs.push(`Gemini Nano (${error.message})`);
          console.warn('❌ Gemini Nano failed:', error);
        }
      }
      
      // Try Writer API
      if (window.ai.writer) {
        try {
          apiAttempts.push('Testing Writer API...');
          const writerCaps = await window.ai.writer.capabilities();
          if (writerCaps.available !== 'no') {
            aiAPIs.writer = await window.ai.writer.create();
            availableAPIs.push('Writer API');
            console.log('✅ Writer API ready');
          } else {
            failedAPIs.push('Writer API (not available)');
          }
        } catch (error) {
          failedAPIs.push(`Writer API (${error.message})`);
          console.warn('❌ Writer API failed:', error);
        }
      }
      
      // Try Rewriter API
      if (window.ai.rewriter) {
        try {
          apiAttempts.push('Testing Rewriter API...');
          const rewriterCaps = await window.ai.rewriter.capabilities();
          if (rewriterCaps.available !== 'no') {
            aiAPIs.rewriter = await window.ai.rewriter.create();
            availableAPIs.push('Rewriter API');
            console.log('✅ Rewriter API ready');
          } else {
            failedAPIs.push('Rewriter API (not available)');
          }
        } catch (error) {
          failedAPIs.push(`Rewriter API (${error.message})`);
          console.warn('❌ Rewriter API failed:', error);
        }
      }
    } else {
      failedAPIs.push('Chrome AI (not detected)');
    }
    
    // === TIER 2: Chrome Origin Trial APIs ===
    if (!aiAvailable && typeof chrome !== 'undefined' && chrome.aiOriginTrial) {
      try {
        apiAttempts.push('Testing Chrome Origin Trial...');
        const session = await chrome.aiOriginTrial.languageModel.create({
          systemPrompt: 'You are a professional email assistant.'
        });
        aiAPIs.languageModel = session;
        availableAPIs.push('Chrome Origin Trial');
        aiAvailable = true;
        console.log('✅ Chrome AI Origin Trial ready');
      } catch (error) {
        failedAPIs.push(`Chrome Origin Trial (${error.message})`);
        console.warn('❌ Origin Trial failed:', error);
      }
    }
    
    // === TIER 3: Alternative Browser APIs ===
    if (!aiAvailable) {
      // Check for Edge AI
      if (typeof window.edgeAI !== 'undefined') {
        try {
          apiAttempts.push('Testing Edge AI...');
          const edgeSession = await window.edgeAI.createSession();
          aiAPIs.languageModel = {
            prompt: async (text) => await edgeSession.generate(text),
            destroy: () => edgeSession.close()
          };
          availableAPIs.push('Edge AI');
          aiAvailable = true;
          console.log('✅ Edge AI ready');
        } catch (error) {
          failedAPIs.push(`Edge AI (${error.message})`);
          console.warn('❌ Edge AI failed:', error);
        }
      } else {
        failedAPIs.push('Edge AI (not detected)');
      }
      
      // Check for Brave AI
      if (typeof window.braveAI !== 'undefined') {
        try {
          apiAttempts.push('Testing Brave AI...');
          const braveSession = await window.braveAI.createSession();
          aiAPIs.languageModel = {
            prompt: async (text) => await braveSession.query(text),
            destroy: () => braveSession.end()
          };
          availableAPIs.push('Brave AI');
          aiAvailable = true;
          console.log('✅ Brave AI ready');
        } catch (error) {
          failedAPIs.push(`Brave AI (${error.message})`);
          console.warn('❌ Brave AI failed:', error);
        }
      } else {
        failedAPIs.push('Brave AI (not detected)');
      }
    }
    
    // === TIER 4: Smart Template System (Always Available) ===
    if (!aiAvailable) {
      console.log('⚠️ No browser AI available, activating Smart Template System');
      apiAttempts.push('Activating Smart Templates fallback...');
      // Create a mock AI that uses smart templates
      aiAPIs.languageModel = {
        prompt: async (text) => {
          return generateSmartTemplate(text);
        },
        destroy: () => {}
      };
      availableAPIs.push('Smart Templates (Offline Mode)');
      aiAvailable = true;
    }
    
    // Store the primary API being used
    window.lastUsedAPI = availableAPIs[0] || 'None';
    window.failedAPIs = failedAPIs;
    window.availableAPIs = availableAPIs;
    
    // Show detailed status
    console.log('═══════════════════════════════════');
    console.log('📊 AI System Status Report:');
    console.log('═══════════════════════════════════');
    
    if (availableAPIs.length > 0) {
      console.log('✅ Available APIs:', availableAPIs.join(', '));
      console.log('🎯 Primary API:', availableAPIs[0]);
    }
    
    if (failedAPIs.length > 0) {
      console.log('❌ Failed APIs:', failedAPIs.join(', '));
    }
    
    console.log('═══════════════════════════════════');
    
    // Show user notification with details
    if (availableAPIs.length > 0) {
      const primaryAPI = availableAPIs[0];
      let message = `✅ Active: ${primaryAPI}`;
      
      if (failedAPIs.length > 0) {
        message += ` | ❌ Failed: ${failedAPIs.length} APIs`;
      }
      
      if (primaryAPI === 'Smart Templates (Offline Mode)') {
        showMailNotification(message, 'warning');
      } else {
        showMailNotification(message, 'success');
      }
    } else {
      showMailNotification('❌ No AI systems available', 'error');
      showManualInstructions();
    }
    
    return aiAvailable;
    
  } catch (error) {
    console.error('Failed to initialize any AI:', error);
    // Fallback to smart templates
    aiAPIs.languageModel = {
      prompt: async (text) => generateSmartTemplate(text),
      destroy: () => {}
    };
    return true;
  }
}

// Smart Template Generator (Fallback when no AI is available)
function generateSmartTemplate(prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Extract key information from prompt
  if (lowerPrompt.includes('based on this request:') || lowerPrompt.includes('based on this description:')) {
    const description = prompt.split('"')[1] || prompt;
    return generateSmartFallback(description).subject + '\n\n' + generateSmartFallback(description).body;
  }
  
  // Handle specific email actions
  if (lowerPrompt.includes('professional')) {
    return makeProfessional(prompt);
  }
  
  if (lowerPrompt.includes('grammar') || lowerPrompt.includes('fix')) {
    return fixGrammar(prompt);
  }
  
  if (lowerPrompt.includes('shorten')) {
    return shortenText(prompt);
  }
  
  return prompt; // Return original if no pattern matches
}

// Enhanced template functions
function makeProfessional(text) {
  // Extract the original email content
  const emailContent = text.split('Original email:')[1] || text;
  
  // Apply professional transformations
  let professional = emailContent
    .replace(/hi\b/gi, 'Dear')
    .replace(/hey\b/gi, 'Hello')
    .replace(/thanks\b/gi, 'Thank you')
    .replace(/bye\b/gi, 'Best regards')
    .replace(/yeah\b/gi, 'yes')
    .replace(/ok\b/gi, 'certainly')
    .replace(/asap/gi, 'at your earliest convenience')
    .replace(/fyi/gi, 'for your information');
  
  return professional;
}

function fixGrammar(text) {
  // Extract the original email content
  const emailContent = text.split('Original email:')[1] || text;
  
  // Basic grammar fixes
  let fixed = emailContent
    .replace(/\si\s/g, ' I ')
    .replace(/^i\s/gim, 'I ')
    .replace(/\.\s*([a-z])/g, (match, p1) => '. ' + p1.toUpperCase())
    .replace(/\s+/g, ' ')
    .replace(/,([^ ])/g, ', $1')
    .replace(/\s+\./g, '.')
    .replace(/\s+,/g, ',');
  
  // Capitalize first letter
  fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
  
  return fixed;
}

function shortenText(text) {
  // Extract the original email content
  const emailContent = text.split('Original email:')[1] || text;
  
  // Keep only essential sentences
  const sentences = emailContent.split('.').filter(s => s.trim());
  const essential = sentences
    .filter(s => !s.includes('hope') && !s.includes('trust') && !s.includes('believe'))
    .slice(0, Math.ceil(sentences.length * 0.6));
  
  return essential.join('. ') + '.';
}

// Email templates
const emailTemplates = {
  meeting: {
    subject: 'Meeting Request - [Topic]',
    body: `Dear [Name],

I hope this email finds you well. I would like to schedule a meeting to discuss [topic/purpose].

Would you be available for a [duration] meeting on [proposed date/time]? If this doesn't work for your schedule, please let me know your availability, and I'll do my best to accommodate.

Looking forward to our discussion.

Best regards,
[Your Name]`
  },
  followup: {
    subject: 'Follow-up: [Previous Topic]',
    body: `Hi [Name],

I wanted to follow up on our recent conversation about [topic]. 

[Add specific follow-up points or questions here]

Please let me know if you need any additional information or if you have any questions.

Thank you for your time.

Best regards,
[Your Name]`
  },
  thank: {
    subject: 'Thank You - [Reason]',
    body: `Dear [Name],

I wanted to take a moment to express my sincere gratitude for [specific reason].

[Add more specific details about what you're thankful for]

Your [help/support/time] is greatly appreciated.

Warm regards,
[Your Name]`
  },
  introduction: {
    subject: 'Introduction - [Your Name]',
    body: `Hi [Name],

I hope this email finds you well. My name is [Your Name], and I'm [your role/position].

[Add context about why you're reaching out]

I would appreciate the opportunity to [specific request or purpose].

Looking forward to connecting with you.

Best regards,
[Your Name]`
  },
  apology: {
    subject: 'Apology for [Issue]',
    body: `Dear [Name],

I sincerely apologize for [specific issue/mistake].

[Explain what happened and take responsibility]

To make things right, I [proposed solution or action].

Thank you for your understanding and patience.

Sincerely,
[Your Name]`
  }
};

// Initialize mail compose when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
  const aiInitialized = await initializeMailAI();
  setupMailCompose();
  const apiName = window.lastUsedAPI || getCurrentAPIName();
  updateAIStatus(aiInitialized, apiName);
});

// Setup mail compose functionality
function setupMailCompose() {
  // Load saved draft on startup
  loadSavedDraft();
  
  // Auto-save draft on input (Zeigarnik Effect - show task indicator)
  const mailFields = ['mailDescription', 'mailSubject', 'mailBody'];
  mailFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', () => {
        showTaskIndicator();
        debounce(saveDraftToStorage, 1000)();
      });
    }
  });
  
  // Template cards (UX Laws optimized)
  const templateCards = document.querySelectorAll('.template-card');
  templateCards.forEach(card => {
    card.addEventListener('click', function() {
      // Remove active from all cards
      templateCards.forEach(c => c.classList.remove('active'));
      // Add active to clicked card
      this.classList.add('active');
      
      // Set the prompt
      const prompt = this.dataset.prompt;
      const descField = document.getElementById('mailDescription');
      if (descField) {
        descField.value = prompt;
        descField.focus();
        // Auto-generate after template selection (Flow state)
        setTimeout(() => {
          document.getElementById('generateFromDescription')?.click();
        }, 300);
      }
    });
  });
  
  // Polish buttons (simplified options)
  const polishButtons = document.querySelectorAll('.polish-btn');
  polishButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      await processMailWithAI(action);
      updateProgressFlow('Polish');
    });
  });

  // Template buttons (legacy)
  const templateButtons = document.querySelectorAll('.template-btn');
  templateButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const templateType = btn.dataset.template;
      loadTemplate(templateType);
    });
  });

  // AI option buttons (legacy)
  const aiOptionButtons = document.querySelectorAll('.ai-option-btn');
  aiOptionButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      processMailWithAI(action);
    });
  });

  // Generate from description button (main generation)
  const generateFromDescBtn = document.getElementById('generateFromDescription');
  if (generateFromDescBtn) {
    generateFromDescBtn.addEventListener('click', () => {
      generateCompleteEmail();
      updateProgressFlow('Polish');
    });
  }
  
  // Copy mail button (Peak-End Rule)
  const copyMailBtn = document.getElementById('copyMailBtn');
  if (copyMailBtn) {
    copyMailBtn.addEventListener('click', () => {
      copyEmailToClipboard();
      updateProgressFlow('Send');
      hideTaskIndicator();
    });
  }

  // Clear mail button
  const clearMailBtn = document.getElementById('clearMailBtn');
  if (clearMailBtn) {
    clearMailBtn.addEventListener('click', () => {
      clearEmailForm();
      updateProgressFlow('Write');
      hideTaskIndicator();
    });
  }
  
  // Add context-aware button for inserting page content
  addPageContextButton();
  
  // Setup quick prompt chips
  setupQuickPrompts();
  
  // Setup keyboard shortcuts (Doherty Threshold - Fast interaction)
  setupKeyboardShortcuts();
  
  // Setup progress tracking for compact design
  setupCompactProgressTracking();
  
  // Setup enhancement buttons for compact design
  setupCompactEnhanceButtons();
  
  // Save draft button
  const saveBtn = document.getElementById('saveAsDraftBtn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveDraftToStorage();
      showMailNotification('Draft saved successfully', 'success');
    });
  }
}

// Setup quick prompt chips functionality
function setupQuickPrompts() {
  const promptChips = document.querySelectorAll('.prompt-chip');
  promptChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const promptType = chip.dataset.prompt;
      const descField = document.getElementById('mailDescription');
      if (descField) {
        // Map prompt types to full descriptions
        const promptTexts = {
          'Follow up after meeting': 'Write a follow-up email after our team meeting today about the Q4 product roadmap',
          'Request information': 'Request information about project timeline and budget details',
          'Thank someone': 'Thank my colleague for their help with the presentation yesterday',
          'Apologize for issue': 'Apologize for the delay in responding to the client proposal',
          'Schedule meeting': 'Schedule a meeting next week to discuss the marketing strategy'
        };
        
        const promptText = promptTexts[promptType] || promptType;
        descField.value = promptText;
        descField.focus();
        
        // Visual feedback
        chip.style.transform = 'scale(0.95)';
        setTimeout(() => {
          chip.style.transform = '';
        }, 100);
      }
    });
  });
}

// Setup keyboard shortcuts for better UX
function setupKeyboardShortcuts() {
  const descField = document.getElementById('mailDescription');
  const generateBtn = document.getElementById('generateFromDescription');
  
  // Enter key to generate (when in description field)
  if (descField && generateBtn) {
    descField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateBtn.click();
      }
    });
  }
  
  // Ctrl/Cmd + Enter to copy email
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      const copyBtn = document.getElementById('copyMailBtn');
      if (copyBtn && !copyBtn.disabled) {
        copyBtn.click();
      }
    }
  });
}

// Setup progress tracking (Goal-Gradient Effect)
function setupProgressTracking() {
  updateProgress(1); // Start at step 1
}

// Setup compact progress tracking with dots
function setupCompactProgressTracking() {
  updateCompactProgress(1); // Start at step 1
}

function updateProgress(step) {
  // Update regular progress steps (if they exist)
  const steps = document.querySelectorAll('.progress-step');
  steps.forEach((stepEl, index) => {
    const stepNum = index + 1;
    if (stepNum < step) {
      stepEl.classList.remove('active');
      stepEl.classList.add('completed');
    } else if (stepNum === step) {
      stepEl.classList.add('active');
      stepEl.classList.remove('completed');
    } else {
      stepEl.classList.remove('active', 'completed');
    }
  });
  
  // Also update compact dots
  updateCompactProgress(step);
}

function updateCompactProgress(step) {
  // Update compact progress dots
  const dots = document.querySelectorAll('.progress-dots .dot');
  dots.forEach((dot, index) => {
    const dotStep = index + 1;
    if (dotStep < step) {
      dot.classList.remove('active');
      dot.classList.add('completed');
    } else if (dotStep === step) {
      dot.classList.add('active');
      dot.classList.remove('completed');
    } else {
      dot.classList.remove('active', 'completed');
    }
  });
}

// Setup enhancement buttons for compact design
function setupCompactEnhanceButtons() {
  const enhanceButtons = document.querySelectorAll('.enhance-btn');
  enhanceButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const action = btn.dataset.action;
      
      // Check if there's content to enhance
      const bodyField = document.getElementById('mailBody');
      if (!bodyField.value.trim() && (action !== 'grammar')) {
        showMailNotification('Please generate or write email content first', 'warning');
        return;
      }
      
      // Process with AI
      await processMailWithAI(action);
    });
  });
}

// Load email template
function loadTemplate(templateType) {
  const template = emailTemplates[templateType];
  if (!template) return;

  const subjectField = document.getElementById('mailSubject');
  const bodyField = document.getElementById('mailBody');

  if (subjectField) subjectField.value = template.subject;
  if (bodyField) bodyField.value = template.body;

  // Show notification
  showMailNotification(`Template "${templateType}" loaded. Please customize the placeholders.`);
}

// Process email with AI using Chrome APIs
async function processMailWithAI(action) {
  const bodyField = document.getElementById('mailBody');
  const subjectField = document.getElementById('mailSubject');
  const currentText = bodyField.value.trim();

  if (!currentText) {
    showMailNotification('Please write some content first', 'warning');
    bodyField.focus();
    return;
  }

  // Check if AI is available
  if (!aiAPIs.languageModel) {
    const initialized = await initializeMailAI();
    if (!initialized) {
      showMailNotification('Chrome AI not available. Please enable it in chrome://flags', 'error');
      return;
    }
  }

  // Show processing state
  setMailProcessing(true);

  try {
    let processedText = '';
    let prompt = '';
    
    // Build specific prompts for each action
    switch (action) {
      case 'shorten':
        prompt = `Make this email shorter and more concise. Keep only the essential points. Remove unnecessary words and phrases.

Original email:
${currentText}

Shortened version:`;
        break;
        
      case 'elaborate':
        prompt = `Make this email more detailed and comprehensive. Add more context and explanation where needed.

Original email:
${currentText}

Expanded version:`;
        break;
        
      case 'grammar':
        prompt = `Fix all grammar and spelling errors in this email. Keep the same tone and meaning.

Original email:
${currentText}

Corrected version:`;
        break;
        
      case 'professional':
        prompt = `Rewrite this email in a more professional and formal tone. Use business-appropriate language.

Original email:
${currentText}

Professional version:`;
        break;
        
      case 'friendly':
        prompt = `Rewrite this email in a more friendly and casual tone while maintaining respect and clarity.

Original email:
${currentText}

Friendly version:`;
        break;
        
      case 'summarize':
        prompt = `Summarize this email into its key points. Keep it brief and clear.

Original email:
${currentText}

Summary:`;
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }
    
    // Use Chrome AI Language Model
    if (aiAPIs.languageModel && prompt) {
      try {
        const apiName = window.lastUsedAPI || 'AI';
        console.log(`Processing email with action: ${action} using ${apiName}`);
        showMailNotification(`🔄 ${action === 'grammar' ? 'Fixing grammar' : action === 'shorten' ? 'Shortening' : action === 'professional' ? 'Making professional' : 'Processing'} with ${apiName}...`, 'info');
        
        processedText = await aiAPIs.languageModel.prompt(prompt);
        console.log('Processing complete');
        
        if (processedText) {
          showMailNotification(`✅ ${action === 'grammar' ? 'Grammar fixed' : action === 'shorten' ? 'Shortened' : action === 'professional' ? 'Made professional' : 'Processed'} with ${apiName}`, 'success');
        }
      } catch (error) {
        console.error(`${window.lastUsedAPI} processing failed:`, error);
        showMailNotification(`⚠️ ${window.lastUsedAPI} failed, using fallback`, 'warning');
        processedText = '';
      }
    }
    
    // Apply the processed text or show error
    if (processedText) {
      bodyField.value = processedText;
    } else {
      // Use local fallback
      const fallbackText = processMailLocally(action, currentText);
      if (fallbackText) {
        bodyField.value = fallbackText;
        showMailNotification(`✅ ${action === 'grammar' ? 'Grammar fixed' : action === 'shorten' ? 'Shortened' : 'Processed'} with Smart Templates`, 'info');
      } else {
        showMailNotification(`❌ Unable to ${action} email. No AI available.`, 'error');
      }
    }
  } catch (error) {
    console.error('Error processing email:', error);
    showMailNotification(`Failed to ${action} email. Please try again.`, 'error');
  } finally {
    setMailProcessing(false);
  }
}

// Generate complete email from description using Chrome AI
async function generateCompleteEmail() {
  const descriptionField = document.getElementById('mailDescription');
  const subjectField = document.getElementById('mailSubject');
  const bodyField = document.getElementById('mailBody');
  
  const description = descriptionField.value.trim();
  
  if (!description) {
    showMailNotification('Please describe what email you want to create', 'warning');
    // Shake animation for feedback
    descriptionField.classList.add('shake');
    setTimeout(() => descriptionField.classList.remove('shake'), 500);
    return;
  }
  
  // Check if AI is available or reinitialize
  if (!aiAPIs.languageModel) {
    const initialized = await initializeMailAI();
    if (!initialized) {
      showMailNotification('No AI available. Using Smart Templates.', 'info');
    }
  }
  
  // Hide instructions if using fallback
  const instructionsBox = document.querySelector('.ai-instructions');
  if (instructionsBox && aiAPIs.languageModel) {
    instructionsBox.style.display = 'none';
  }
  
  // Update progress to step 2
  updateProgress(2);
  updateProgressFlow('Polish');
  setMailProcessing(true);
  
  try {
    let generatedContent = '';
    
    // Use available AI to generate email
    if (aiAPIs.languageModel) {
      const prompt = `You are a professional email writer. Based on this request: "${description}"

Please generate:
1. A clear and concise subject line
2. A complete, professional email body

Format your response EXACTLY as:
Subject: [your generated subject line]

Dear [Recipient],

[email body paragraphs]

Best regards,
[Sender name]

Important: Keep it professional, clear, and to the point.`;
      
      try {
        const apiName = window.lastUsedAPI || 'AI';
        console.log(`Generating email with ${apiName}...`);
        showMailNotification(`🔄 Generating with ${apiName}...`, 'info');
        
        generatedContent = await aiAPIs.languageModel.prompt(prompt);
        console.log('Response received:', generatedContent ? 'Success' : 'Empty');
        
        if (generatedContent) {
          showMailNotification(`✅ Generated successfully with ${apiName}`, 'success');
        }
      } catch (error) {
        console.error('Generation failed:', error);
        showMailNotification(`⚠️ ${window.lastUsedAPI} failed, switching to Smart Templates`, 'warning');
        
        // Fallback to smart templates
        generatedContent = generateSmartTemplate(prompt);
        
        if (generatedContent) {
          showMailNotification('✅ Generated with Smart Templates', 'info');
        }
      }
    }
    
    if (generatedContent) {
      // Parse subject and body
      const lines = generatedContent.split('\n');
      let subject = '';
      let body = '';
      
      // Extract subject
      if (lines[0].toLowerCase().startsWith('subject:')) {
        subject = lines[0].replace(/^subject:\s*/i, '').trim();
        body = lines.slice(2).join('\n').trim(); // Skip subject line and empty line
      } else {
        // If no subject format found, use first line as subject
        subject = `Email regarding: ${description.substring(0, 50)}...`;
        body = generatedContent;
      }
      
      // Set the fields
      subjectField.value = subject;
      bodyField.value = body;
      
      showMailNotification('Email generated successfully! Review and customize as needed', 'success');
      
      // Update progress to step 3
      updateProgress(3);
      
      // Auto-save the generated content
      saveDraftToStorage();
      
      // Smooth scroll to generated content
      subjectField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      // Enhanced fallback with smart template generation
      const fallbackContent = generateSmartFallback(description);
      subjectField.value = fallbackContent.subject;
      bodyField.value = fallbackContent.body;
      showMailNotification('Template created. Please customize as needed.', 'info');
      updateProgress(3);
    }
  } catch (error) {
    console.error('Error generating complete email:', error);
    showMailNotification('Failed to generate email. Please try again.', 'error');
  } finally {
    setMailProcessing(false);
  }
}

// Generate smart fallback based on keywords
function generateSmartFallback(description) {
  const lowerDesc = description.toLowerCase();
  let subject = '';
  let body = '';
  
  // Detect email type from description
  if (lowerDesc.includes('follow up') || lowerDesc.includes('follow-up')) {
    subject = `Follow-up: ${description.substring(0, 40)}`;
    body = `Dear [Recipient],

I hope this email finds you well. I wanted to follow up on our previous discussion regarding ${description}.

[Add specific details about what you're following up on]

I would appreciate your thoughts on this matter.

Best regards,
[Your Name]`;
  } else if (lowerDesc.includes('meeting') || lowerDesc.includes('schedule')) {
    subject = `Meeting Request: ${description.substring(0, 40)}`;
    body = `Dear [Recipient],

I would like to schedule a meeting to discuss ${description}.

Would you be available [suggest specific times]? Please let me know what works best for your schedule.

Looking forward to our discussion.

Best regards,
[Your Name]`;
  } else if (lowerDesc.includes('thank')) {
    subject = `Thank You - ${description.substring(0, 40)}`;
    body = `Dear [Recipient],

I wanted to express my sincere gratitude for ${description}.

[Add specific details about what you're thankful for]

Thank you once again for your time and consideration.

Warm regards,
[Your Name]`;
  } else if (lowerDesc.includes('request') || lowerDesc.includes('ask')) {
    subject = `Request: ${description.substring(0, 40)}`;
    body = `Dear [Recipient],

I am writing to request ${description}.

[Provide context and specific details about your request]

I would greatly appreciate your assistance with this matter.

Thank you for your consideration.

Best regards,
[Your Name]`;
  } else {
    // Generic professional template
    subject = `Regarding: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`;
    body = `Dear [Recipient],

I am writing to you regarding ${description}.

[Add your main message here]

Please let me know if you need any additional information.

Best regards,
[Your Name]`;
  }
  
  return { subject, body };
}

// Show manual instructions for enabling Chrome AI
function showManualInstructions() {
  // Create a comprehensive status panel
  const availableAPIs = window.availableAPIs || [];
  const failedAPIs = window.failedAPIs || [];
  const currentAPI = window.lastUsedAPI || 'None';
  
  // Build failed APIs list
  let failedList = '';
  if (failedAPIs.length > 0) {
    failedList = `
      <div style="margin-top: 8px; padding: 8px; background: #ffebee; border-radius: 4px;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #c62828; font-weight: 600;">❌ Failed APIs (${failedAPIs.length}):</p>
        <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 11px; color: #d32f2f;">
          ${failedAPIs.map(api => `<li>${api}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  // Build available APIs list
  let availableList = '';
  if (availableAPIs.length > 1) {
    availableList = `
      <div style="margin-top: 8px; padding: 8px; background: #e8f5e9; border-radius: 4px;">
        <p style="margin: 0 0 4px 0; font-size: 12px; color: #2e7d32; font-weight: 600;">✅ Backup APIs Available:</p>
        <ul style="margin: 4px 0 0 0; padding-left: 20px; font-size: 11px; color: #388e3c;">
          ${availableAPIs.slice(1).map(api => `<li>${api}</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  const instructionsHTML = `
    <div style="position: relative; background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%); border: 2px solid #e0e0e0; padding: 16px 32px 16px 16px; border-radius: 8px; margin: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <button onclick="this.parentElement.parentElement.style.display='none'" style="position: absolute; top: 8px; right: 8px; background: none; border: none; color: #666; font-size: 20px; cursor: pointer; padding: 4px 8px;">×</button>
      
      <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #333;">
        🤖 AI System Status
      </h3>
      
      <!-- Current Status -->
      <div style="padding: 8px; background: ${currentAPI.includes('Chrome') ? '#e3f2fd' : currentAPI.includes('Smart') ? '#fff3e0' : '#f5f5f5'}; border-radius: 4px; margin-bottom: 8px;">
        <p style="margin: 0; font-size: 13px; color: #333;">
          <strong>Active:</strong> 
          <span style="color: ${currentAPI.includes('Chrome') ? '#1976d2' : currentAPI.includes('Smart') ? '#f57c00' : '#666'}; font-weight: 600;">
            ${currentAPI}
          </span>
        </p>
      </div>
      
      ${failedList}
      ${availableList}
      
      <!-- Chrome AI Setup (Collapsible) -->
      ${currentAPI !== 'Chrome Language Model' && currentAPI !== 'Gemini Nano' ? `
      <details style="margin-top: 12px;">
        <summary style="color: #666; cursor: pointer; font-size: 13px; font-weight: 600;">
          🚀 Enable Chrome AI for Better Results
        </summary>
        <div style="margin-top: 8px; padding: 8px; background: #fff3cd; border-radius: 4px;">
          <ol style="color: #856404; margin: 4px 0; padding-left: 20px; font-size: 12px; line-height: 1.5;">
            <li>Open <code style="font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 11px; background: #fff; padding: 1px 4px; border-radius: 2px;">chrome://flags</code></li>
            <li>Search for <strong>"optimization guide on device"</strong></li>
            <li>Enable it (set to "Enabled BypassPerfRequirement")</li>
            <li>Search for <strong>"gemini nano"</strong></li>
            <li>Enable <strong>"Prompt API for Gemini Nano"</strong></li>
            <li>Click <strong>"Relaunch"</strong> button</li>
            <li>Return here - AI will be ready!</li>
          </ol>
          <p style="color: #856404; margin: 4px 0 0 0; font-size: 11px;">
            📋 Requirements: Chrome 127+ on Desktop | ~2GB disk space
          </p>
        </div>
      </details>
      ` : ''}
      
      <!-- Refresh Button -->
      <button onclick="location.reload()" style="margin-top: 12px; padding: 6px 12px; background: #4285f4; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; font-weight: 500;">
        🔄 Refresh to Check Again
      </button>
    </div>
  `;
  
  // Insert status panel into the mail form
  const mailForm = document.querySelector('.mail-form');
  if (mailForm && !document.querySelector('.ai-instructions')) {
    const instructionsDiv = document.createElement('div');
    instructionsDiv.className = 'ai-instructions';
    instructionsDiv.innerHTML = instructionsHTML;
    mailForm.insertBefore(instructionsDiv, mailForm.firstChild);
  }
}

// Generate email draft using Chrome Writer API
async function generateEmailDraft() {
  const subjectField = document.getElementById('mailSubject');
  const bodyField = document.getElementById('mailBody');
  
  const subject = subjectField.value.trim();
  const briefContent = bodyField.value.trim();

  if (!subject && !briefContent) {
    showMailNotification('Please provide a subject or brief description', 'warning');
    return;
  }

  setMailProcessing(true);

  try {
    let generatedEmail = '';
    
    // Try to use Chrome's Writer API first
    if (aiAPIs.writer) {
      try {
        const context = {
          subject: subject || 'general topic',
          notes: briefContent || ''
        };
        
        const writePrompt = `Write a professional email about ${subject || 'the topic'}. ${briefContent ? `Include these points: ${briefContent}` : ''}`;
        
        generatedEmail = await aiAPIs.writer.write(writePrompt, {
          context: JSON.stringify(context)
        });
      } catch (error) {
        console.warn('Writer API failed, falling back:', error);
      }
    }
    
    // Fallback to Language Model API
    if (!generatedEmail && aiAPIs.languageModel) {
      const prompt = `Generate a professional email with the following details:
      ${subject ? `Subject: ${subject}` : ''}
      ${briefContent ? `Brief content/notes: ${briefContent}` : ''}
      
      Please create a complete, well-structured email with proper greeting and closing.`;

      generatedEmail = await aiAPIs.languageModel.prompt(prompt);
    }
    
    // Final fallback to Chrome runtime message
    if (!generatedEmail && typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        const response = await chrome.runtime.sendMessage({
          action: 'generateEmail',
          data: {
            subject,
            content: briefContent
          }
        });
        if (response && response.result) {
          generatedEmail = response.result;
        }
      } catch (error) {
        console.warn('Chrome runtime fallback failed:', error);
      }
    }
    
    if (generatedEmail) {
      bodyField.value = generatedEmail;
      showMailNotification('Email draft generated successfully!', 'success');
    } else {
      // Use template as last resort
      const fallbackEmail = `Dear [Recipient],

${briefContent || `I hope this email finds you well.

[Your message here]`}

Best regards,
[Your Name]`;
      bodyField.value = fallbackEmail;
      showMailNotification('Basic template loaded. Please customize it.', 'info');
    }
  } catch (error) {
    console.error('Error generating draft:', error);
    showMailNotification('Failed to generate email draft. Please try again.', 'error');
  } finally {
    setMailProcessing(false);
  }
}

// Cleanup AI resources when leaving mail compose
function cleanupMailAI() {
  // Destroy AI sessions to free resources
  if (aiAPIs.writer) {
    try {
      aiAPIs.writer.destroy();
    } catch (e) {}
    aiAPIs.writer = null;
  }
  
  if (aiAPIs.rewriter) {
    try {
      aiAPIs.rewriter.destroy();
    } catch (e) {}
    aiAPIs.rewriter = null;
  }
  
  if (aiAPIs.summarizer) {
    try {
      aiAPIs.summarizer.destroy();
    } catch (e) {}
    aiAPIs.summarizer = null;
  }
  
  if (aiAPIs.languageModel) {
    try {
      if (aiAPIs.languageModel.destroy) {
        aiAPIs.languageModel.destroy();
      }
    } catch (e) {}
    aiAPIs.languageModel = null;
  }
}

// Local processing fallback (simple transformations)
function processMailLocally(action, text) {
  switch(action) {
    case 'shorten':
      // Simple shortening - take first few sentences
      const sentences = text.split('.').filter(s => s.trim());
      return sentences.slice(0, Math.ceil(sentences.length * 0.6)).join('. ') + '.';
    
    case 'elaborate':
      return text + '\n\n[Please add more details here to expand on the above points]';
    
    case 'grammar':
      // Basic capitalization and punctuation fixes
      let corrected = text.charAt(0).toUpperCase() + text.slice(1);
      corrected = corrected.replace(/\si\s/g, ' I ');
      corrected = corrected.replace(/\.\s*([a-z])/g, (match, p1) => '. ' + p1.toUpperCase());
      return corrected;
    
    case 'professional':
      let professional = text.replace(/\bhi\b/gi, 'Dear');
      professional = professional.replace(/\bthanks\b/gi, 'Thank you');
      professional = professional.replace(/\bbye\b/gi, 'Best regards');
      professional = professional.replace(/\byeah\b/gi, 'yes');
      professional = professional.replace(/\bokay\b/gi, 'certainly');
      return professional;
    
    case 'friendly':
      let friendly = text.replace(/\bDear\b/gi, 'Hi');
      friendly = friendly.replace(/\bSincerely\b/gi, 'Best');
      friendly = friendly.replace(/\bRegards\b/gi, 'Thanks');
      return friendly;
    
    case 'summarize':
      const lines = text.split('\n').filter(l => l.trim());
      const summary = lines.slice(0, Math.min(3, lines.length)).join('\n');
      return `Summary:\n${summary}\n\n[Main points extracted from email]`;
    
    default:
      return text;
  }
}

// Copy email to clipboard
async function copyEmailToClipboard() {
  const subjectField = document.getElementById('mailSubject');
  const bodyField = document.getElementById('mailBody');

  const subject = subjectField.value.trim();
  const body = bodyField.value.trim();

  if (!body) {
    showMailNotification('Please write some email content first', 'warning');
    bodyField.focus();
    return;
  }

  // Format email content for easy pasting
  const emailContent = subject ? `Subject: ${subject}\n\n${body}` : body;

  try {
    await navigator.clipboard.writeText(emailContent);
    
    // Enhanced visual feedback (Peak-End Rule)
    const copyBtn = document.getElementById('copyMailBtn');
    if (copyBtn) {
      copyBtn.classList.add('success');
      
      // Update button text temporarily
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = '✓ Copied!';
      
      // Haptic feedback simulation (if available)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      setTimeout(() => {
        copyBtn.classList.remove('success');
        copyBtn.innerHTML = originalText;
      }, 2000);
    }
    
    // Update progress to completed (both regular and compact)
    updateProgress(3);
    const steps = document.querySelectorAll('.progress-step');
    steps.forEach(step => step.classList.add('completed'));
    const dots = document.querySelectorAll('.progress-dots .dot');
    dots.forEach(dot => dot.classList.add('completed'));
    
    showMailNotification('✨ Email copied! Ready to paste in Gmail/Outlook', 'success');
  } catch (error) {
    console.error('Failed to copy:', error);
    showMailNotification('Failed to copy email. Please try again.', 'error');
  }
}

// Clear email form
function clearEmailForm() {
  const fields = ['mailDescription', 'mailSubject', 'mailBody'];
  fields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) field.value = '';
  });
  
  showMailNotification('Email form cleared', 'success');
  
  // Clear storage too
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.remove('mailDraft');
  }
}

// Show notification for mail compose
function showMailNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `mail-notification mail-notification-${type}`;
  notification.textContent = message;
  
  // Add styles
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 12px 20px;
    background: ${type === 'success' ? '#34a853' : type === 'warning' ? '#fbbc04' : type === 'error' ? '#ea4335' : '#4285f4'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
  `;

  document.body.appendChild(notification);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Set processing state
function setMailProcessing(processing) {
  const buttons = document.querySelectorAll('.mail-btn, .ai-option-btn, .template-btn, .generate-btn');
  buttons.forEach(btn => {
    btn.disabled = processing;
  });

  const generateFromDescBtn = document.getElementById('generateFromDescription');
  if (generateFromDescBtn) {
    const originalHTML = generateFromDescBtn.innerHTML;
    if (processing) {
      generateFromDescBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v6M12 16v6M4 12h6M16 12h6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Generating...
      `;
    } else {
      generateFromDescBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M13 2L3 14l9 9L22 13z"/>
          <circle cx="13" cy="13" r="3"/>
        </svg>
        Generate Complete Email
      `;
    }
  }

  const generateBtn = document.getElementById('generateDraftBtn');
  if (generateBtn) {
    generateBtn.textContent = processing ? 'Processing...' : 'Generate Draft';
  }
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
  }
  
  .shake {
    animation: shake 0.5s ease;
  }
`;
document.head.appendChild(style);

// Chrome Storage API functions for draft management
async function saveDraftToStorage() {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  
  const draft = {
    description: document.getElementById('mailDescription')?.value || '',
    subject: document.getElementById('mailSubject').value,
    body: document.getElementById('mailBody').value,
    timestamp: Date.now()
  };
  
  try {
    await chrome.storage.local.set({ mailDraft: draft });
    console.log('Draft saved');
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
}

async function loadSavedDraft() {
  if (typeof chrome === 'undefined' || !chrome.storage) return;
  
  try {
    const result = await chrome.storage.local.get('mailDraft');
    if (result.mailDraft) {
      const draft = result.mailDraft;
      
      // Only load if draft is less than 24 hours old
      if (Date.now() - draft.timestamp < 24 * 60 * 60 * 1000) {
        const descField = document.getElementById('mailDescription');
        if (descField) descField.value = draft.description || '';
        document.getElementById('mailSubject').value = draft.subject || '';
        document.getElementById('mailBody').value = draft.body || '';
        
        if (draft.description || draft.subject || draft.body) {
          showMailNotification('Previous draft restored', 'info');
        }
      }
    }
  } catch (error) {
    console.error('Failed to load draft:', error);
  }
}

// Get selected text from active tab
async function getSelectedTextFromPage() {
  if (typeof chrome === 'undefined' || !chrome.tabs) return '';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) return '';
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getSelection' });
    return response?.text || '';
  } catch (error) {
    console.error('Failed to get selected text:', error);
    return '';
  }
}

// Add button to insert page context
function addPageContextButton() {
  const aiOptionsBar = document.querySelector('.mail-ai-options');
  if (!aiOptionsBar || document.getElementById('pageContextBtn')) return;
  
  const pageContextBtn = document.createElement('button');
  pageContextBtn.id = 'pageContextBtn';
  pageContextBtn.className = 'ai-option-btn';
  pageContextBtn.dataset.action = 'page-context';
  pageContextBtn.title = 'Insert current page content';
  pageContextBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
    Page Context
  `;
  
  pageContextBtn.addEventListener('click', async () => {
    await insertPageContext();
  });
  
  aiOptionsBar.appendChild(pageContextBtn);
}

// Insert current page context into email
async function insertPageContext() {
  if (typeof chrome === 'undefined' || !chrome.tabs) return;
  
  setMailProcessing(true);
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      showMailNotification('No active tab found', 'warning');
      return;
    }
    
    // Get page content
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'getPageContent' });
    
    if (response && response.content) {
      const bodyField = document.getElementById('mailBody');
      const currentContent = bodyField.value.trim();
      
      // Create a context summary using AI if available
      if (aiAPIs.summarizer) {
        try {
          const summary = await aiAPIs.summarizer.summarize(response.content);
          
          const contextText = `\n\n---\nContext from: ${tab.title || 'Current Page'}\nURL: ${tab.url}\n\nSummary:\n${summary}\n---\n`;
          
          bodyField.value = currentContent + contextText;
          showMailNotification('Page context added with summary', 'success');
        } catch (error) {
          // Fallback to raw content
          const contextText = `\n\n---\nContext from: ${tab.title || 'Current Page'}\nURL: ${tab.url}\n\nContent:\n${response.content.substring(0, 500)}...\n---\n`;
          
          bodyField.value = currentContent + contextText;
          showMailNotification('Page context added', 'success');
        }
      } else {
        // No AI available, add raw context
        const contextText = `\n\n---\nContext from: ${tab.title || 'Current Page'}\nURL: ${tab.url}\n\nContent:\n${response.content.substring(0, 500)}...\n---\n`;
        
        bodyField.value = currentContent + contextText;
        showMailNotification('Page context added', 'success');
      }
      
      // Save draft after adding context
      saveDraftToStorage();
    } else {
      showMailNotification('Could not get page content', 'warning');
    }
  } catch (error) {
    console.error('Failed to insert page context:', error);
    showMailNotification('Failed to get page content', 'error');
  } finally {
    setMailProcessing(false);
  }
}

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Update AI status indicator with API info
function updateAIStatus(isAvailable, apiName = null) {
  const statusEl = document.createElement('div');
  statusEl.className = 'ai-status-indicator';
  
  // Determine status color and message
  let bgColor, icon, message;
  
  if (apiName === 'Smart Templates') {
    bgColor = '#2196f3'; // Blue for template mode
    icon = '📝';
    message = 'Smart Templates Mode';
  } else if (apiName && isAvailable) {
    bgColor = '#4caf50'; // Green for AI active
    icon = '🤖';
    message = apiName;
  } else if (isAvailable) {
    bgColor = '#4caf50';
    icon = '✅';
    message = 'AI Ready';
  } else {
    bgColor = '#ff9800'; // Orange for offline
    icon = '⚠️';
    message = 'AI Offline - Templates Active';
  }
  
  statusEl.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 8px 16px;
    background: ${bgColor};
    color: white;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 10000;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    cursor: pointer;
  `;
  
  statusEl.innerHTML = `${icon} ${message}`;
  
  // Add click to open dashboard
  statusEl.addEventListener('click', () => {
    // Open the API status dashboard
    if (window.mailCompose && window.mailCompose.showAPIStatusDashboard) {
      window.mailCompose.showAPIStatusDashboard();
    } else {
      // Fallback: toggle instructions
      const instructions = document.querySelector('.ai-instructions');
      if (instructions) {
        instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none';
      }
    }
  });
  
  // Remove existing status if any
  const existing = document.querySelector('.ai-status-indicator');
  if (existing) existing.remove();
  
  // Add to mail section when visible
  const mailSection = document.getElementById('mailSection');
  if (mailSection && mailSection.style.display !== 'none') {
    document.body.appendChild(statusEl);
    
    // Auto-hide after 5 seconds if AI is fully available
    if (isAvailable && apiName !== 'Smart Templates') {
      setTimeout(() => {
        if (document.querySelector('.ai-status-indicator') === statusEl) {
          statusEl.remove();
        }
      }, 5000);
    }
  }
}

// Get current API name
function getCurrentAPIName() {
  if (aiAPIs.languageModel) {
    // Check which API is active
    if (aiAPIs.languageModel.prompt.toString().includes('generateSmartTemplate')) {
      return 'Smart Templates';
    }
    // Try to detect from console logs or stored info
    return window.lastUsedAPI || 'Chrome AI';
  }
  return null;
}

// Test Chrome AI functionality
async function testChromeAI() {
  console.log('🧪 Testing Chrome AI...');
  
  // Check various API availability
  const tests = {
    'window.ai exists': typeof window.ai !== 'undefined',
    'window.ai.languageModel exists': window.ai?.languageModel !== undefined,
    'window.ai.createTextSession exists': window.ai?.createTextSession !== undefined,
    'chrome.aiOriginTrial exists': chrome?.aiOriginTrial !== undefined
  };
  
  console.log('API Availability:', tests);
  
  // Try to create a session
  if (window.ai?.languageModel) {
    try {
      const capabilities = await window.ai.languageModel.capabilities();
      console.log('Language Model Capabilities:', capabilities);
      
      if (capabilities.available !== 'no') {
        const session = await window.ai.languageModel.create();
        const testResponse = await session.prompt('Write a one-line test response.');
        console.log('✅ Test successful! Response:', testResponse);
        session.destroy();
        return true;
      }
    } catch (error) {
      console.error('❌ Test failed:', error);
    }
  }
  
  return false;
}

// Show task indicator (Zeigarnik Effect)
function showTaskIndicator() {
  const indicator = document.getElementById('taskIndicator');
  if (indicator) {
    indicator.style.display = 'flex';
  }
}

// Hide task indicator
function hideTaskIndicator() {
  const indicator = document.getElementById('taskIndicator');
  if (indicator) {
    indicator.style.display = 'none';
  }
}

// Update progress flow (simplified)
function updateProgressFlow(step) {
  const flowSteps = document.querySelectorAll('.flow-step');
  const stepMap = {
    'Write': 0,
    'Polish': 1,
    'Send': 2
  };
  
  const stepIndex = stepMap[step] ?? 0;
  
  flowSteps.forEach((flowStep, index) => {
    if (index < stepIndex) {
      flowStep.classList.remove('active');
      flowStep.classList.add('completed');
    } else if (index === stepIndex) {
      flowStep.classList.add('active');
      flowStep.classList.remove('completed');
    } else {
      flowStep.classList.remove('active', 'completed');
    }
  });
}

// Show API Status Dashboard
function showAPIStatusDashboard() {
  const dashboard = document.createElement('div');
  dashboard.className = 'api-status-dashboard';
  dashboard.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.2);
    padding: 24px;
    max-width: 500px;
    z-index: 10001;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
  `;
  
  const availableAPIs = window.availableAPIs || [];
  const failedAPIs = window.failedAPIs || [];
  const currentAPI = window.lastUsedAPI || 'None';
  
  dashboard.innerHTML = `
    <button onclick="this.parentElement.remove()" style="position: absolute; top: 12px; right: 12px; background: none; border: none; font-size: 24px; cursor: pointer; color: #666;">×</button>
    
    <h2 style="margin: 0 0 20px 0; color: #333; font-size: 20px;">🤖 AI System Status Dashboard</h2>
    
    <!-- Current Active API -->
    <div style="background: linear-gradient(135deg, #4285f4 0%, #1a73e8 100%); color: white; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
      <div style="font-size: 12px; opacity: 0.9; margin-bottom: 4px;">CURRENTLY ACTIVE</div>
      <div style="font-size: 18px; font-weight: 600;">${currentAPI}</div>
      <div style="font-size: 11px; margin-top: 8px; opacity: 0.9;">
        ${currentAPI.includes('Chrome') ? '🚀 Native Chrome AI - Fast & Private' : 
          currentAPI.includes('Smart') ? '📝 Template Engine - Always Available' : 
          '⚠️ No AI Active'}
      </div>
    </div>
    
    <!-- Available APIs -->
    ${availableAPIs.length > 0 ? `
    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 14px; color: #333; margin: 0 0 8px 0;">✅ Available APIs (${availableAPIs.length})</h3>
      <div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${availableAPIs.map((api, index) => `
          <div style="
            padding: 6px 12px;
            background: ${index === 0 ? '#e8f5e9' : '#f5f5f5'};
            border: 1px solid ${index === 0 ? '#4caf50' : '#e0e0e0'};
            border-radius: 16px;
            font-size: 12px;
            color: ${index === 0 ? '#2e7d32' : '#666'};
            font-weight: ${index === 0 ? '600' : '400'};
          ">
            ${index === 0 ? '🎯' : '↪️'} ${api}
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}
    
    <!-- Failed APIs -->
    ${failedAPIs.length > 0 ? `
    <div style="margin-bottom: 16px;">
      <h3 style="font-size: 14px; color: #333; margin: 0 0 8px 0;">❌ Failed APIs (${failedAPIs.length})</h3>
      <details style="background: #ffebee; padding: 8px; border-radius: 6px;">
        <summary style="cursor: pointer; font-size: 12px; color: #c62828; font-weight: 500;">View Details</summary>
        <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 11px; color: #d32f2f;">
          ${failedAPIs.map(api => `<li>${api}</li>`).join('')}
        </ul>
      </details>
    </div>
    ` : ''}
    
    <!-- Chrome Version Check -->
    <div style="background: #f5f5f5; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
      <div style="font-size: 12px; color: #666;">
        <strong>Browser:</strong> ${navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other'} | 
        <strong>Version:</strong> ${navigator.userAgent.match(/Chrome\/([0-9]+)/)?.[1] || 'Unknown'}
      </div>
    </div>
    
    <!-- Actions -->
    <div style="display: flex; gap: 8px;">
      <button onclick="location.reload()" style="
        flex: 1;
        padding: 10px;
        background: #4285f4;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      ">🔄 Refresh Extension</button>
      
      <button onclick="this.parentElement.parentElement.remove()" style="
        padding: 10px 20px;
        background: #f5f5f5;
        color: #666;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
      ">Close</button>
    </div>
  `;
  
  document.body.appendChild(dashboard);
  
  // Add backdrop
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 10000;
  `;
  backdrop.onclick = () => {
    dashboard.remove();
    backdrop.remove();
  };
  document.body.appendChild(backdrop);
}

// Export functions for external access
window.mailCompose = {
  initializeMailAI,
  cleanupMailAI,
  saveDraftToStorage,
  loadSavedDraft,
  updateAIStatus,
  testChromeAI,
  updateProgressFlow,
  showAPIStatusDashboard
};
