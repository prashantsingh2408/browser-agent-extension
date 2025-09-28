// Content script for Browser Agent Extension
// Handles page interaction and content extraction

// Main message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle function execution for quick action buttons
  if (request.action === 'executeFunction') {
    handleFunctionExecution(request.function, request.parameters)
      .then(result => {
        sendResponse({ result });
      })
      .catch(error => {
        sendResponse({ error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  // Legacy handlers for backward compatibility
  switch(request.action) {
    case 'getPageContent':
      sendResponse({ content: getPageContent() });
      break;
    case 'getSelection':
      sendResponse({ text: window.getSelection().toString() });
      break;
    case 'findVideos':
      sendResponse({ videos: findVideosOnPage() });
      break;
    default:
      sendResponse({ error: 'Unknown action' });
  }
  return true;
});

// Function execution handler
async function handleFunctionExecution(functionName, parameters = {}) {
  const functions = {
    getPageContent: () => getPageContentAdvanced(parameters),
    getSelectedText: () => getSelectedText(),
    getPageMetadata: () => getPageMetadata(),
    findElements: () => findElements(parameters.selector, parameters.limit, parameters.extractText),
    getImages: () => getImages(parameters.includeBackgroundImages),
    getLinks: () => getLinks(parameters.internal, parameters.external),
    getVideos: () => getVideos(),
    getForms: () => getForms(),
    clickElement: () => clickElement(parameters.selector),
    fillInput: () => fillInput(parameters.selector, parameters.value),
    scrollToElement: () => scrollToElement(parameters.selector, parameters.smooth),
    extractTable: () => extractTable(parameters.selector, parameters.format),
    takeScreenshot: () => takeScreenshot(parameters.selector),
    analyzePageStructure: () => analyzePageStructure(),
    searchInPage: () => searchInPage(parameters.query, parameters.caseSensitive, parameters.wholeWord)
  };
  
  if (!functions[functionName]) {
    throw new Error(`Function ${functionName} not implemented`);
  }
  
  return await functions[functionName]();
}

// Enhanced page content extraction
function getPageContentAdvanced(options = {}) {
  const { selector, includeMetadata = true } = options;
  
  let content = '';
  let element = document.body;
  
  if (selector) {
    element = document.querySelector(selector);
    if (!element) {
      return { error: `No element found for selector: ${selector}` };
    }
  } else {
    // Try to find main content area
    const mainContent = document.querySelector('article, main, [role="main"], .content, #content');
    if (mainContent) {
      element = mainContent;
    }
  }
  
  // Clean and extract text
  const clonedElement = element.cloneNode(true);
  
  // Remove unwanted elements
  const unwantedSelectors = 'script, style, noscript, iframe, object, embed, .advertisement, .ad, .popup, .modal';
  clonedElement.querySelectorAll(unwantedSelectors).forEach(el => el.remove());
  
  content = clonedElement.innerText || clonedElement.textContent || '';
  content = cleanText(content);
  
  if (includeMetadata) {
    return {
      content,
      metadata: getPageMetadata(),
      length: content.length,
      wordCount: content.split(/\s+/).length
    };
  }
  
  return { content };
}

// Get selected text
function getSelectedText() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  
  if (!text) {
    return { text: '', message: 'No text selected' };
  }
  
  // Get context around selection
  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer;
  const parentElement = container.nodeType === 3 ? container.parentElement : container;
  
  return {
    text,
    context: {
      parentTag: parentElement.tagName,
      parentClass: parentElement.className,
      parentId: parentElement.id
    }
  };
}

// Get page metadata
function getPageMetadata() {
  const metadata = {
    title: document.title,
    url: window.location.href,
    domain: window.location.hostname,
    description: '',
    keywords: [],
    author: '',
    publishedDate: '',
    modifiedDate: '',
    language: document.documentElement.lang || 'unknown',
    charset: document.characterSet,
    viewport: '',
    ogData: {},
    twitterData: {},
    schemaData: []
  };
  
  // Get meta tags
  const metaTags = document.querySelectorAll('meta');
  metaTags.forEach(tag => {
    const name = tag.getAttribute('name') || tag.getAttribute('property');
    const content = tag.getAttribute('content');
    
    if (name && content) {
      // Standard meta tags
      if (name === 'description') metadata.description = content;
      if (name === 'keywords') metadata.keywords = content.split(',').map(k => k.trim());
      if (name === 'author') metadata.author = content;
      if (name === 'viewport') metadata.viewport = content;
      
      // Open Graph tags
      if (name.startsWith('og:')) {
        metadata.ogData[name.replace('og:', '')] = content;
      }
      
      // Twitter Card tags
      if (name.startsWith('twitter:')) {
        metadata.twitterData[name.replace('twitter:', '')] = content;
      }
      
      // Article tags
      if (name === 'article:published_time') metadata.publishedDate = content;
      if (name === 'article:modified_time') metadata.modifiedDate = content;
    }
  });
  
  // Get schema.org data
  const schemas = document.querySelectorAll('script[type="application/ld+json"]');
  schemas.forEach(schema => {
    try {
      const data = JSON.parse(schema.textContent);
      metadata.schemaData.push(data);
    } catch (e) {
      console.error('Failed to parse schema:', e);
    }
  });
  
  return metadata;
}

// Find elements on page
function findElements(selector, limit = 10, extractText = true) {
  if (!selector) {
    return { error: 'Selector is required' };
  }
  
  try {
    const elements = Array.from(document.querySelectorAll(selector)).slice(0, limit);
    
    return {
      count: document.querySelectorAll(selector).length,
      elements: elements.map((el, index) => {
        const data = {
          index,
          tagName: el.tagName.toLowerCase(),
          id: el.id,
          className: el.className,
          attributes: {}
        };
        
        // Get attributes
        Array.from(el.attributes).forEach(attr => {
          data.attributes[attr.name] = attr.value;
        });
        
        // Extract text if requested
        if (extractText) {
          data.text = el.innerText || el.textContent || '';
          data.text = data.text.substring(0, 500); // Limit text length
        }
        
        // Get position
        const rect = el.getBoundingClientRect();
        data.position = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          visible: rect.width > 0 && rect.height > 0
        };
        
        return data;
      })
    };
  } catch (error) {
    return { error: `Invalid selector: ${error.message}` };
  }
}

// Get all images
function getImages(includeBackgroundImages = false) {
  const images = [];
  
  // Get img tags
  document.querySelectorAll('img').forEach(img => {
    if (img.src) {
      images.push({
        type: 'img',
        src: img.src,
        alt: img.alt,
        title: img.title,
        width: img.naturalWidth,
        height: img.naturalHeight,
        loading: img.loading,
        visible: isElementVisible(img)
      });
    }
  });
  
  // Get background images if requested
  if (includeBackgroundImages) {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      const style = window.getComputedStyle(el);
      const backgroundImage = style.backgroundImage;
      
      if (backgroundImage && backgroundImage !== 'none') {
        const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
        if (urlMatch && urlMatch[1]) {
          images.push({
            type: 'background',
            src: urlMatch[1],
            element: el.tagName.toLowerCase(),
            className: el.className,
            visible: isElementVisible(el)
          });
        }
      }
    });
  }
  
  return {
    count: images.length,
    images: images
  };
}

// Get all links
function getLinks(internal = null, external = null) {
  const links = Array.from(document.querySelectorAll('a[href]'));
  const currentDomain = window.location.hostname;
  
  let filteredLinks = links;
  
  if (internal === true) {
    filteredLinks = links.filter(link => {
      const url = new URL(link.href, window.location.origin);
      return url.hostname === currentDomain;
    });
  } else if (external === true) {
    filteredLinks = links.filter(link => {
      try {
        const url = new URL(link.href, window.location.origin);
        return url.hostname !== currentDomain;
      } catch {
        return false;
      }
    });
  }
  
  return {
    count: filteredLinks.length,
    links: filteredLinks.slice(0, 100).map(link => ({
      href: link.href,
      text: link.innerText || link.textContent || '',
      title: link.title,
      target: link.target,
      rel: link.rel,
      isInternal: (() => {
        try {
          const url = new URL(link.href, window.location.origin);
          return url.hostname === currentDomain;
        } catch {
          return false;
        }
      })()
    }))
  };
}

// Get videos on page  
function getVideos() {
  const videos = [];
  
  // HTML5 videos
  document.querySelectorAll('video').forEach(video => {
    videos.push({
      type: 'html5',
      src: video.src || video.currentSrc,
      sources: Array.from(video.querySelectorAll('source')).map(s => ({
        src: s.src,
        type: s.type
      })),
      poster: video.poster,
      duration: video.duration,
      width: video.width,
      height: video.height,
      autoplay: video.autoplay,
      controls: video.controls,
      muted: video.muted,
      loop: video.loop
    });
  });
  
  // YouTube iframes
  document.querySelectorAll('iframe').forEach(iframe => {
    const src = iframe.src;
    if (src && (src.includes('youtube.com') || src.includes('youtu.be'))) {
      videos.push({
        type: 'youtube',
        src: src,
        title: iframe.title,
        width: iframe.width,
        height: iframe.height
      });
    } else if (src && src.includes('vimeo.com')) {
      videos.push({
        type: 'vimeo',
        src: src,
        title: iframe.title,
        width: iframe.width,
        height: iframe.height
      });
    }
  });
  
  return {
    count: videos.length,
    videos: videos
  };
}

// Legacy function for finding videos
function findVideosOnPage() {
  const videos = [];
  
  document.querySelectorAll('video').forEach(video => {
    videos.push({
      type: 'html5',
      src: video.src || video.currentSrc,
      title: video.title || 'Video on page'
    });
  });
  
  document.querySelectorAll('iframe').forEach(iframe => {
    if (iframe.src.includes('youtube.com') || iframe.src.includes('youtu.be')) {
      videos.push({
        type: 'youtube',
        src: iframe.src,
        title: iframe.title || 'YouTube video'
      });
    }
  });
  
  return videos;
}

// Get forms on page
function getForms() {
  const forms = Array.from(document.querySelectorAll('form'));
  
  return {
    count: forms.length,
    forms: forms.map((form, index) => {
      const inputs = Array.from(form.querySelectorAll('input, select, textarea'));
      
      return {
        index,
        id: form.id,
        name: form.name,
        action: form.action,
        method: form.method,
        className: form.className,
        fields: inputs.map(input => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          required: input.required,
          value: input.type === 'password' ? '[hidden]' : input.value,
          options: input.tagName === 'SELECT' ? 
            Array.from(input.options).map(opt => ({ value: opt.value, text: opt.text })) : null
        }))
      };
    })
  };
}

// Click element
function clickElement(selector) {
  if (!selector) {
    return { error: 'Selector is required' };
  }
  
  try {
    const element = document.querySelector(selector);
    if (!element) {
      return { error: `No element found for selector: ${selector}` };
    }
    
    // Simulate click
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    
    element.dispatchEvent(clickEvent);
    
    return {
      success: true,
      element: {
        tagName: element.tagName.toLowerCase(),
        text: element.innerText || element.textContent || '',
        id: element.id,
        className: element.className
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Fill input field
function fillInput(selector, value) {
  if (!selector || value === undefined) {
    return { error: 'Selector and value are required' };
  }
  
  try {
    const input = document.querySelector(selector);
    if (!input) {
      return { error: `No input found for selector: ${selector}` };
    }
    
    // Set value
    input.value = value;
    
    // Trigger input and change events
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    return {
      success: true,
      field: {
        type: input.type || input.tagName.toLowerCase(),
        name: input.name,
        id: input.id,
        value: input.type === 'password' ? '[hidden]' : value
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Scroll to element
function scrollToElement(selector, smooth = true) {
  if (!selector) {
    return { error: 'Selector is required' };
  }
  
  try {
    const element = document.querySelector(selector);
    if (!element) {
      return { error: `No element found for selector: ${selector}` };
    }
    
    element.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'center',
      inline: 'center'
    });
    
    return {
      success: true,
      scrolledTo: {
        tagName: element.tagName.toLowerCase(),
        id: element.id,
        className: element.className
      }
    };
  } catch (error) {
    return { error: error.message };
  }
}

// Extract table data
function extractTable(selector, format = 'json') {
  const tables = selector ? 
    document.querySelectorAll(selector) : 
    document.querySelectorAll('table');
  
  if (tables.length === 0) {
    return { error: 'No tables found' };
  }
  
  const tablesData = Array.from(tables).map(table => {
    const headers = [];
    const rows = [];
    
    // Get headers
    const headerCells = table.querySelectorAll('thead th, thead td, tr:first-child th, tr:first-child td');
    headerCells.forEach(cell => {
      headers.push(cell.innerText || cell.textContent || '');
    });
    
    // Get rows
    const dataRows = table.querySelectorAll('tbody tr, tr:not(:first-child)');
    dataRows.forEach(row => {
      const rowData = [];
      const cells = row.querySelectorAll('td, th');
      cells.forEach(cell => {
        rowData.push(cell.innerText || cell.textContent || '');
      });
      if (rowData.length > 0) {
        rows.push(rowData);
      }
    });
    
    return { headers, rows };
  });
  
  // Format output
  if (format === 'csv') {
    return {
      tables: tablesData.map(table => {
        const csv = [table.headers.join(',')];
        table.rows.forEach(row => {
          csv.push(row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','));
        });
        return csv.join('\n');
      })
    };
  } else if (format === 'text') {
    return {
      tables: tablesData.map(table => {
        const text = [];
        text.push(table.headers.join(' | '));
        text.push('-'.repeat(50));
        table.rows.forEach(row => {
          text.push(row.join(' | '));
        });
        return text.join('\n');
      })
    };
  }
  
  return { tables: tablesData };
}

// Take screenshot
async function takeScreenshot(selector) {
  // Note: This requires background script to handle actual screenshot
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'captureScreenshot',
      selector: selector
    });
    return response;
  } catch (error) {
    return { error: 'Screenshot requires additional setup in background script' };
  }
}

// Analyze page structure
function analyzePageStructure() {
  const structure = {
    documentInfo: {
      title: document.title,
      url: window.location.href,
      domain: window.location.hostname,
      protocol: window.location.protocol,
      language: document.documentElement.lang || 'unknown'
    },
    elements: {
      headings: {},
      images: 0,
      links: 0,
      forms: 0,
      tables: 0,
      videos: 0,
      iframes: 0,
      scripts: 0,
      stylesheets: 0
    },
    semantics: {
      hasHeader: !!document.querySelector('header'),
      hasNav: !!document.querySelector('nav'),
      hasMain: !!document.querySelector('main'),
      hasArticle: !!document.querySelector('article'),
      hasAside: !!document.querySelector('aside'),
      hasFooter: !!document.querySelector('footer')
    },
    accessibility: {
      imagesWithAlt: 0,
      imagesWithoutAlt: 0,
      formsWithLabels: 0,
      ariaElements: 0,
      tabIndexElements: 0
    },
    performance: {
      domNodes: document.getElementsByTagName('*').length,
      documentSize: document.documentElement.outerHTML.length
    }
  };
  
  // Count headings by level
  for (let i = 1; i <= 6; i++) {
    structure.elements.headings[`h${i}`] = document.querySelectorAll(`h${i}`).length;
  }
  
  // Count other elements
  structure.elements.images = document.querySelectorAll('img').length;
  structure.elements.links = document.querySelectorAll('a').length;
  structure.elements.forms = document.querySelectorAll('form').length;
  structure.elements.tables = document.querySelectorAll('table').length;
  structure.elements.videos = document.querySelectorAll('video').length;
  structure.elements.iframes = document.querySelectorAll('iframe').length;
  structure.elements.scripts = document.querySelectorAll('script').length;
  structure.elements.stylesheets = document.querySelectorAll('link[rel="stylesheet"]').length;
  
  // Accessibility checks
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    if (img.alt) {
      structure.accessibility.imagesWithAlt++;
    } else {
      structure.accessibility.imagesWithoutAlt++;
    }
  });
  
  // Count forms with proper labels
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input, select, textarea');
    const labels = form.querySelectorAll('label');
    if (labels.length >= inputs.length / 2) {
      structure.accessibility.formsWithLabels++;
    }
  });
  
  // Count ARIA elements
  structure.accessibility.ariaElements = document.querySelectorAll('[role], [aria-label], [aria-describedby]').length;
  structure.accessibility.tabIndexElements = document.querySelectorAll('[tabindex]').length;
  
  return structure;
}

// Search in page
function searchInPage(query, caseSensitive = false, wholeWord = false) {
  if (!query) {
    return { error: 'Search query is required' };
  }
  
  const matches = [];
  const searchRegex = wholeWord ? 
    new RegExp(`\\b${escapeRegex(query)}\\b`, caseSensitive ? 'g' : 'gi') :
    new RegExp(escapeRegex(query), caseSensitive ? 'g' : 'gi');
  
  // Get all text nodes
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        // Skip script and style elements
        const parent = node.parentElement;
        if (parent && (parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE')) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );
  
  let node;
  while (node = walker.nextNode()) {
    const text = node.textContent;
    const foundMatches = text.match(searchRegex);
    
    if (foundMatches) {
      foundMatches.forEach(match => {
        const index = text.indexOf(match);
        const contextStart = Math.max(0, index - 50);
        const contextEnd = Math.min(text.length, index + match.length + 50);
        const context = text.substring(contextStart, contextEnd);
        
        matches.push({
          match: match,
          context: context,
          element: {
            tagName: node.parentElement.tagName.toLowerCase(),
            id: node.parentElement.id,
            className: node.parentElement.className
          }
        });
      });
    }
  }
  
  return {
    query: query,
    matchCount: matches.length,
    matches: matches.slice(0, 50) // Limit to first 50 matches
  };
}

// Helper functions
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  
  return rect.width > 0 && 
         rect.height > 0 && 
         style.display !== 'none' && 
         style.visibility !== 'hidden' &&
         style.opacity !== '0';
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Legacy function for backward compatibility
function getPageContent() {
  const article = document.querySelector('article, main, [role="main"], .content, #content');
  if (article) {
    return cleanText(article.innerText);
  }
  
  const body = document.body.cloneNode(true);
  const elementsToRemove = body.querySelectorAll(
    'script, style, noscript, nav, header, footer, aside, .sidebar, .navigation, .menu'
  );
  elementsToRemove.forEach(el => el.remove());
  
  return cleanText(body.innerText);
}

// Content script loaded
