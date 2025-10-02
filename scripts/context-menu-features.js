// Context Menu Features - Right-click integrations for Smart Features

// Create context menu items on install
chrome.runtime.onInstalled.addListener(() => {
  console.log('🎯 Creating smart feature context menus...');

  // 1. Image Analysis
  chrome.contextMenus.create({
    id: 'analyze-image',
    title: '🖼️ Analyze Image with AI',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'generate-alt-text',
    title: '♿ Generate Alt Text',
    contexts: ['image']
  });

  chrome.contextMenus.create({
    id: 'extract-image-text',
    title: '📝 Extract Text from Image',
    contexts: ['image']
  });

  // 2. Text Operations
  chrome.contextMenus.create({
    id: 'rewrite-professional',
    title: '✍️ Rewrite as Professional',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'rewrite-casual',
    title: '😊 Rewrite as Casual',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'simplify-text',
    title: '📖 Simplify Text',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'analyze-sentiment',
    title: '😊 Analyze Sentiment',
    contexts: ['selection']
  });

  chrome.contextMenus.create({
    id: 'explain-code',
    title: '💻 Explain Code',
    contexts: ['selection']
  });

  // 3. Page Operations
  chrome.contextMenus.create({
    id: 'summarize-page',
    title: '📄 Summarize Page',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'extract-key-points',
    title: '🔑 Extract Key Points',
    contexts: ['page']
  });

  chrome.contextMenus.create({
    id: 'categorize-page',
    title: '🏷️ Categorize Page',
    contexts: ['page']
  });

  console.log('✅ Context menus created!');
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log('Context menu clicked:', info.menuItemId);

  try {
    switch (info.menuItemId) {
      case 'analyze-image':
        await handleImageAnalysis(info, tab);
        break;
      
      case 'generate-alt-text':
        await handleAltTextGeneration(info, tab);
        break;
      
      case 'extract-image-text':
        await handleImageTextExtraction(info, tab);
        break;
      
      case 'rewrite-professional':
        await handleTextRewrite(info, tab, 'professional');
        break;
      
      case 'rewrite-casual':
        await handleTextRewrite(info, tab, 'casual');
        break;
      
      case 'simplify-text':
        await handleTextRewrite(info, tab, 'simple');
        break;
      
      case 'analyze-sentiment':
        await handleSentimentAnalysis(info, tab);
        break;
      
      case 'explain-code':
        await handleCodeExplanation(info, tab);
        break;
      
      case 'summarize-page':
        await handlePageSummarization(tab);
        break;
      
      case 'extract-key-points':
        await handleKeyPointsExtraction(tab);
        break;
      
      case 'categorize-page':
        await handlePageCategorization(tab);
        break;
    }
  } catch (error) {
    console.error('Context menu action failed:', error);
    showNotification('Error', error.message, 'error');
  }
});

// Handler Functions

async function handleImageAnalysis(info, tab) {
  showNotification('Analyzing Image...', 'This may take a moment', 'info');

  try {
    // Execute in page context
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (imageUrl) => {
        if (window.smartFeatures) {
          return await window.smartFeatures.analyzeImage(imageUrl, 'description');
        }
        return 'Smart features not loaded';
      },
      args: [info.srcUrl]
    });

    const analysis = result[0].result;
    showResultInSidepanel('Image Analysis', analysis, tab.id);

  } catch (error) {
    console.error('Image analysis failed:', error);
    showNotification('Analysis Failed', error.message, 'error');
  }
}

async function handleAltTextGeneration(info, tab) {
  showNotification('Generating Alt Text...', 'Creating accessibility description', 'info');

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (imageUrl) => {
        if (window.smartFeatures) {
          return await window.smartFeatures.analyzeImage(imageUrl, 'accessibility');
        }
        return 'Smart features not loaded';
      },
      args: [info.srcUrl]
    });

    const altText = result[0].result;
    
    // Copy to clipboard
    await copyToClipboard(altText);
    showNotification('Alt Text Generated!', altText.substring(0, 100) + '...', 'success');

  } catch (error) {
    console.error('Alt text generation failed:', error);
    showNotification('Generation Failed', error.message, 'error');
  }
}

async function handleImageTextExtraction(info, tab) {
  showNotification('Extracting Text...', 'Reading text from image', 'info');

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (imageUrl) => {
        if (window.smartFeatures) {
          return await window.smartFeatures.analyzeImage(imageUrl, 'text');
        }
        return 'Smart features not loaded';
      },
      args: [info.srcUrl]
    });

    const extractedText = result[0].result;
    await copyToClipboard(extractedText);
    showNotification('Text Extracted!', 'Copied to clipboard', 'success');

  } catch (error) {
    console.error('Text extraction failed:', error);
    showNotification('Extraction Failed', error.message, 'error');
  }
}

async function handleTextRewrite(info, tab, style) {
  showNotification(`Rewriting (${style})...`, 'Processing text', 'info');

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (text, rewriteStyle) => {
        if (window.smartFeatures) {
          return await window.smartFeatures.rewriteText(text, rewriteStyle);
        }
        return text;
      },
      args: [info.selectionText, style]
    });

    const rewrittenText = result[0].result;
    await copyToClipboard(rewrittenText);
    showNotification('Text Rewritten!', 'Copied to clipboard', 'success');

  } catch (error) {
    console.error('Text rewriting failed:', error);
    showNotification('Rewrite Failed', error.message, 'error');
  }
}

async function handleSentimentAnalysis(info, tab) {
  showNotification('Analyzing Sentiment...', 'Detecting emotions and tone', 'info');

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (text) => {
        if (window.smartFeatures) {
          return await window.smartFeatures.analyzeSentiment(text);
        }
        return { sentiment: 'neutral', summary: 'Analysis unavailable' };
      },
      args: [info.selectionText]
    });

    const sentiment = result[0].result;
    const message = `Sentiment: ${sentiment.sentiment}\nConfidence: ${(sentiment.confidence * 100).toFixed(0)}%\n${sentiment.summary}`;
    showNotification('Sentiment Analysis', message, 'success');

  } catch (error) {
    console.error('Sentiment analysis failed:', error);
    showNotification('Analysis Failed', error.message, 'error');
  }
}

async function handleCodeExplanation(info, tab) {
  showNotification('Explaining Code...', 'Analyzing code snippet', 'info');

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (code) => {
        if (window.smartFeatures) {
          return await window.smartFeatures.explainCode(code);
        }
        return 'Code explanation unavailable';
      },
      args: [info.selectionText]
    });

    const explanation = result[0].result;
    showResultInSidepanel('Code Explanation', explanation, tab.id);

  } catch (error) {
    console.error('Code explanation failed:', error);
    showNotification('Explanation Failed', error.message, 'error');
  }
}

async function handlePageSummarization(tab) {
  showNotification('Summarizing Page...', 'Extracting main points', 'info');

  try {
    // Get page content
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });

    const pageContent = result[0].result;

    // Summarize
    const summary = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (content) => {
        if (window.smartFeatures) {
          return await window.smartFeatures.summarizeContent(content, 'brief');
        }
        return 'Summary unavailable';
      },
      args: [pageContent]
    });

    showResultInSidepanel('Page Summary', summary[0].result, tab.id);

  } catch (error) {
    console.error('Page summarization failed:', error);
    showNotification('Summarization Failed', error.message, 'error');
  }
}

async function handleKeyPointsExtraction(tab) {
  showNotification('Extracting Key Points...', 'Finding important information', 'info');

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => document.body.innerText
    });

    const pageContent = result[0].result;

    const keyPoints = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (content) => {
        if (window.smartFeatures) {
          const points = await window.smartFeatures.extractKeyPoints(content, 7);
          return points.map((p, i) => `${i + 1}. ${p}`).join('\n\n');
        }
        return 'Key points unavailable';
      },
      args: [pageContent]
    });

    showResultInSidepanel('Key Points', keyPoints[0].result, tab.id);

  } catch (error) {
    console.error('Key points extraction failed:', error);
    showNotification('Extraction Failed', error.message, 'error');
  }
}

async function handlePageCategorization(tab) {
  showNotification('Categorizing Page...', 'Analyzing content', 'info');

  try {
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => ({
        title: document.title,
        content: document.body.innerText.substring(0, 1000)
      })
    });

    const { title, content } = result[0].result;

    const category = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (t, c) => {
        if (window.smartFeatures) {
          return await window.smartFeatures.categorizeContent(t, c);
        }
        return 'Other';
      },
      args: [title, content]
    });

    showNotification('Category', `This page is about: ${category[0].result}`, 'success');

  } catch (error) {
    console.error('Categorization failed:', error);
    showNotification('Categorization Failed', error.message, 'error');
  }
}

// Utility Functions

function showNotification(title, message, type = 'info') {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: title,
    message: message,
    priority: 2
  });
}

async function copyToClipboard(text) {
  try {
    // Use offscreen document for clipboard access
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['CLIPBOARD'],
      justification: 'Copy AI results to clipboard'
    });

    await chrome.runtime.sendMessage({
      type: 'copy-to-clipboard',
      text: text
    });

    await chrome.offscreen.closeDocument();
  } catch (error) {
    console.error('Clipboard copy failed:', error);
  }
}

function showResultInSidepanel(title, content, tabId) {
  // Open sidepanel and send result
  chrome.sidePanel.open({ tabId }, () => {
    chrome.runtime.sendMessage({
      type: 'smart-feature-result',
      title: title,
      content: content
    });
  });
}

console.log('✅ Context menu features loaded');

