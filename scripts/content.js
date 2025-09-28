// Content script for Browser Agent Extension
// Handles page interaction and content extraction

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
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

// Get page content for summarization
function getPageContent() {
  // Try to get main content area first
  const article = document.querySelector('article, main, [role="main"], .content, #content');
  if (article) {
    return cleanText(article.innerText);
  }
  
  // Fallback to body content
  const body = document.body.cloneNode(true);
  
  // Remove scripts, styles, and navigation elements
  const elementsToRemove = body.querySelectorAll(
    'script, style, noscript, nav, header, footer, aside, .sidebar, .navigation, .menu'
  );
  elementsToRemove.forEach(el => el.remove());
  
  return cleanText(body.innerText);
}

// Find videos on the page
function findVideosOnPage() {
  const videos = [];
  
  // HTML5 videos
  document.querySelectorAll('video').forEach(video => {
    videos.push({
      type: 'html5',
      src: video.src || video.currentSrc,
      title: video.title || 'Video on page'
    });
  });
  
  // YouTube iframes
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

// Clean and truncate text
function cleanText(text) {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .substring(0, 5000); // Limit to 5000 characters
}

console.log('Browser Agent content script loaded');
