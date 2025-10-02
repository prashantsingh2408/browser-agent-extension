// Memory Management System
// Handles personal memory storage, retrieval, and organization

console.log('🧠 Memory Agent script loading...');

// Memory storage and management
let memories = new Map();
let currentFilter = 'all';
let searchQuery = '';

// Memory categories
const MEMORY_CATEGORIES = {
  personal: { name: 'Personal', color: '#4285f4', icon: '👤' },
  work: { name: 'Work', color: '#34a853', icon: '💼' },
  ideas: { name: 'Ideas', color: '#fbbc04', icon: '💡' },
  tasks: { name: 'Tasks', color: '#ea4335', icon: '✅' },
  notes: { name: 'Notes', color: '#9c27b0', icon: '📝' }
};

// Memory types (inspired by Memory Palace)
const MEMORY_TYPES = {
  text: { name: 'Text', icon: '📝', accept: null },
  image: { name: 'Image', icon: '🖼️', accept: 'image/*' },
  audio: { name: 'Audio', icon: '🎵', accept: 'audio/*' },
  video: { name: 'Video', icon: '🎬', accept: 'video/*' },
  screenshot: { name: 'Screenshot', icon: '📸', accept: 'image/*' }
};

// Initialize Memory system
async function initializeMemory() {
  try {
    console.log('Initializing Memory system...');
    
    // Load memories from storage
    await loadMemories();
    
    // Add sample memories if this is first time (for demo/testing)
    if (memories.size === 0) {
      await createSampleMemories();
    }
    
    // Setup event listeners
    setupMemoryEventListeners();
    
    // Setup keyboard shortcuts (UX Law: Paradox of Active User)
    setupMemoryKeyboardShortcuts();
    
    // Initialize default sub-tab
    switchMemorySubtab('capture');
    
    // Render memories
    renderMemories();
    
    console.log('Memory system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Memory system:', error);
  }
}

// Create sample memories for demo/testing
async function createSampleMemories() {
  console.log('Creating comprehensive sample memories for demo...');
  
  // Load comprehensive sample data
  let samples = [];
  
  // Try to load from external file first
  if (typeof window !== 'undefined' && window.SAMPLE_MEMORIES) {
    samples = window.SAMPLE_MEMORIES;
  } else {
    // Fallback to inline samples
    samples = [
    {
      title: '☕ Morning Coffee Ritual',
      content: 'Had an amazing coffee this morning at the new café downtown. The barista made perfect latte art with a heart shape! Starting the day right with good coffee and positive vibes.',
      category: 'personal',
      tags: ['coffee', 'morning', 'café', 'latte art'],
      type: 'text'
    },
    {
      title: '🌅 Beautiful Sunset View',
      content: 'Captured this breathtaking sunset from my office window today. The sky was painted in shades of orange and pink - nature\'s daily masterpiece.',
      category: 'personal',
      tags: ['sunset', 'office', 'nature', 'photography'],
      type: 'image',
      mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="sunset" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" style="stop-color:#FF6B6B;stop-opacity:1"/><stop offset="50%" style="stop-color:#FFE66D;stop-opacity:1"/><stop offset="100%" style="stop-color:#FF8E53;stop-opacity:1"/></linearGradient></defs><rect width="400" height="300" fill="url(#sunset)"/><circle cx="320" cy="80" r="40" fill="#FFF3A0" opacity="0.9"/><rect x="0" y="200" width="400" height="100" fill="#2C3E50"/><text x="200" y="250" text-anchor="middle" fill="white" font-family="Arial" font-size="16">Beautiful Sunset</text></svg>`)
    },
    {
      title: '🎯 Quarterly Report Success',
      content: 'Finished the quarterly report ahead of deadline! Team collaboration was excellent this month - everyone contributed their best work. Feeling proud of what we accomplished together.',
      category: 'work',
      tags: ['success', 'collaboration', 'achievement', 'teamwork', 'deadline'],
      type: 'text'
    },
    {
      title: '🏔️ Mountain Hiking Adventure',
      content: 'Weekend hiking trip to the mountains was incredible! Reached the summit after 3 hours of climbing. The view from the top made every step worth it.',
      category: 'personal',
      tags: ['hiking', 'mountains', 'adventure', 'fitness'],
      type: 'image',
      mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#87CEEB"/><polygon points="0,300 100,150 200,100 300,120 400,200 400,300" fill="#8FBC8F"/><polygon points="100,150 150,80 200,100" fill="#A0522D"/><polygon points="200,100 250,60 300,120" fill="#696969"/><circle cx="350" cy="50" r="25" fill="#FFD700"/><text x="200" y="280" text-anchor="middle" fill="white" font-family="Arial" font-size="14">Mountain Summit</text></svg>`)
    },
    {
      title: '💡 AI Habit Tracker Idea',
      content: 'New app idea: A habit tracker that uses AI to suggest personalized routines based on your lifestyle and goals. Could analyze patterns and recommend optimal timing for different habits.',
      category: 'ideas',
      tags: ['app', 'AI', 'habits', 'innovation', 'startup'],
      type: 'text'
    },
    {
      title: '🍝 Family Pasta Night',
      content: 'Family dinner last Sunday was amazing - mom\'s homemade pasta was incredible! The whole family gathered around the table sharing stories and laughter. Need to get that secret recipe!',
      category: 'personal',
      tags: ['family', 'dinner', 'pasta', 'recipe', 'memories'],
      type: 'image',
      mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#F5F5DC"/><ellipse cx="200" cy="150" rx="150" ry="100" fill="#8B4513"/><ellipse cx="200" cy="140" rx="140" ry="90" fill="#DEB887"/><circle cx="180" cy="130" r="15" fill="#FF6347"/><circle cx="220" cy="135" r="12" fill="#FF6347"/><circle cx="200" cy="160" r="10" fill="#228B22"/><text x="200" y="250" text-anchor="middle" fill="#8B4513" font-family="Arial" font-size="16">Family Pasta Night</text></svg>`)
    },
    {
      title: '🚀 Production Deployment Success',
      content: 'Successfully deployed the new feature to production! Zero bugs reported so far - the extensive testing phase really paid off. The team collaboration and attention to detail made all the difference.',
      category: 'work',
      tags: ['deployment', 'success', 'collaboration', 'testing', 'achievement'],
      type: 'text'
    },
    {
      title: '🏃‍♀️ Morning Workout Routine',
      content: 'Great morning workout session - 30 minutes of yoga followed by a 5km run. Feeling energized and ready to tackle the day! Consistency is key to building healthy habits.',
      category: 'personal',
      tags: ['workout', 'yoga', 'running', 'fitness', 'morning'],
      type: 'text'
    },
    {
      title: '🔐 Escape Room Victory',
      content: 'Team building event at the escape room was fantastic! We solved all puzzles in record time through excellent collaboration. Great way to achieve success together with colleagues.',
      category: 'work',
      tags: ['team building', 'escape room', 'puzzles', 'collaboration', 'success'],
      type: 'image',
      mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#2C3E50"/><rect x="50" y="50" width="300" height="200" fill="#34495E" stroke="#E74C3C" stroke-width="3"/><circle cx="200" cy="100" r="20" fill="#F39C12"/><rect x="180" y="120" width="40" height="10" fill="#E74C3C"/><polygon points="150,180 200,160 250,180 200,200" fill="#3498DB"/><text x="200" y="270" text-anchor="middle" fill="#ECF0F1" font-family="Arial" font-size="14">Escape Room Victory</text></svg>`)
    },
    {
      title: '🎨 UX Design Learning',
      content: 'Learned about the importance of user experience design today. Small details make huge differences in user satisfaction. The Laws of UX provide excellent insights for better interfaces.',
      category: 'notes',
      tags: ['UX', 'design', 'learning', 'insights', 'user satisfaction'],
      type: 'text'
    },
    {
      title: '🐛 Late Night Debugging Success',
      content: 'Late night coding session paid off - finally fixed that persistent bug that\'s been bothering me for weeks! Great learning experience about problem solving and persistence.',
      category: 'work',
      tags: ['coding', 'debugging', 'success', 'problem solving', 'learning'],
      type: 'text'
    },
    {
      title: '🍓 Fresh Market Finds',
      content: 'Weekend farmers market visit was delightful! Got fresh strawberries and homemade bread from local vendors. Supporting local businesses while getting amazing fresh produce.',
      category: 'personal',
      tags: ['farmers market', 'strawberries', 'bread', 'local', 'weekend'],
      type: 'image',
      mediaData: "data:image/svg+xml;charset=utf-8," + encodeURIComponent(`<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="300" fill="#98FB98"/><rect x="100" y="150" width="200" height="100" fill="#8B4513"/><ellipse cx="150" cy="130" rx="20" ry="15" fill="#FF1493"/><ellipse cx="180" cy="125" rx="18" ry="12" fill="#FF1493"/><ellipse cx="220" cy="130" rx="22" ry="16" fill="#FF1493"/><rect x="250" y="120" width="40" height="60" fill="#DEB887"/><text x="200" y="280" text-anchor="middle" fill="#2E8B57" font-family="Arial" font-size="14">Fresh Market Finds</text></svg>`)
    },
    // Additional samples for better insights patterns
    {
      title: '📚 JavaScript Learning Session',
      content: 'Spent the evening learning advanced JavaScript concepts - async/await patterns and Promise handling. These insights will definitely improve my coding skills and project outcomes.',
      category: 'notes',
      tags: ['JavaScript', 'learning', 'async', 'promises', 'insights', 'coding'],
      type: 'text'
    },
    {
      title: '🎉 Client Presentation Success',
      content: 'Nailed the client presentation today! Our team collaboration and preparation really showed. The client was impressed with our innovative approach and attention to detail.',
      category: 'work',
      tags: ['presentation', 'client', 'success', 'collaboration', 'innovation', 'achievement'],
      type: 'text'
    },
    {
      title: '🧠 Memory Agent Insights',
      content: 'Working on improving the Memory Agent with practical insights instead of abstract features. Learning that users want actionable intelligence from their data, not just storytelling.',
      category: 'notes',
      tags: ['memory agent', 'insights', 'learning', 'user experience', 'intelligence'],
      type: 'text'
    }
    ];
  }
  
  console.log(`Loading ${samples.length} sample memories...`);
  
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    
    // Create strategic date groupings for better connections
    let timestamp;
    const baseTime = Date.now();
    
    if (i < 3) {
      // First 3 memories: Today
      timestamp = baseTime - (Math.random() * 12 * 60 * 60 * 1000); // Within last 12 hours
    } else if (i < 6) {
      // Next 3 memories: 2 days ago
      timestamp = baseTime - (2 * 24 * 60 * 60 * 1000) - (Math.random() * 6 * 60 * 60 * 1000);
    } else if (i < 9) {
      // Next 3 memories: 1 week ago
      timestamp = baseTime - (7 * 24 * 60 * 60 * 1000) - (Math.random() * 12 * 60 * 60 * 1000);
    } else {
      // Remaining memories: Random within last 30 days
      const randomDays = Math.floor(Math.random() * 30) + 1;
      timestamp = baseTime - (randomDays * 24 * 60 * 60 * 1000);
    }
    
    createMemory(
      sample.title,
      sample.content,
      sample.category,
      sample.tags,
      sample.type || 'text',
      sample.mediaData || null,
      { timestamp: timestamp }
    );
  }
  
  await saveMemories();
  console.log(`Created ${samples.length} rich demo memories with images!`);
}

// Setup keyboard shortcuts (UX Law: Paradox of Active User)
function setupMemoryKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only activate shortcuts when Memory tab is active
    const memorySection = document.getElementById('memorySection');
    if (!memorySection || memorySection.style.display === 'none') return;
    
    // Don't trigger if user is typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    if (e.ctrlKey || e.metaKey) {
      switch(e.key.toLowerCase()) {
        case 's':
          e.preventDefault();
          captureScreenshotMemory();
          break;
        case 'r':
          e.preventDefault();
          recordVideoMemory();
          break;
        case 'd':
          e.preventDefault();
          connectGoogleDocs();
          break;
        case 'i':
          e.preventDefault();
          connectGoogleDrive();
          break;
        case 'b':
          e.preventDefault();
          scanBarcode();
          break;
        case 'm':
          e.preventDefault();
          connectMobile();
          break;
      }
    }
  });
}

// Setup event listeners for memory functionality
function setupMemoryEventListeners() {
  // Sub-tab navigation
  const subtabBtns = document.querySelectorAll('.memory-subtab');
  console.log(`Found ${subtabBtns.length} sub-tab buttons`);
  subtabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const targetSubtab = btn.dataset.subtab;
      console.log('Sub-tab clicked:', targetSubtab);
      switchMemorySubtab(targetSubtab);
    });
  });
  
  // Add memory button
  const addMemoryBtn = document.getElementById('addMemoryBtn');
  if (addMemoryBtn) {
    addMemoryBtn.addEventListener('click', showAddMemoryModal);
  }
  
  // Import memory button
  const importMemoryBtn = document.getElementById('importMemoryBtn');
  if (importMemoryBtn) {
    importMemoryBtn.addEventListener('click', importMemories);
  }
  
  // Memory search
  const memorySearch = document.getElementById('memorySearch');
  if (memorySearch) {
    memorySearch.addEventListener('input', handleMemorySearch);
  }
  
  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active filter
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Set current filter
      currentFilter = btn.dataset.filter;
      
      // Re-render memories
      renderMemories();
    });
  });
  
  // Setup control button listeners as backup to onclick
  setTimeout(() => {
    const screenshotBtn = document.querySelector('.control-btn.screenshot-btn');
    const videoBtn = document.querySelector('.control-btn.video-btn');
    const docsBtn = document.querySelector('.control-btn.docs-btn');
    const imagesBtn = document.querySelector('.control-btn.images-btn');
    
    if (screenshotBtn) {
      console.log('✅ Screenshot button found, attaching listener');
      screenshotBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Screenshot button clicked via event listener!');
        captureScreenshotMemory();
      });
    }
    
    if (videoBtn) {
      console.log('✅ Video button found, attaching listener');
      videoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Video button clicked via event listener!');
        recordVideoMemory();
      });
    }
    
    if (docsBtn) {
      console.log('✅ Docs button found, attaching listener');
      docsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Docs button clicked via event listener!');
        connectGoogleDocs();
      });
    }
    
    if (imagesBtn) {
      console.log('✅ Images button found, attaching listener');
      imagesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Images button clicked via event listener!');
        connectGoogleDrive();
      });
    }
    
    const barcodeBtn = document.querySelector('.control-btn.barcode-btn');
    const mobileBtn = document.querySelector('.control-btn.mobile-btn');
    
    if (barcodeBtn) {
      console.log('✅ Barcode button found, attaching listener');
      barcodeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Barcode button clicked via event listener!');
        scanBarcode();
      });
    }
    
    if (mobileBtn) {
      console.log('✅ Mobile button found, attaching listener');
      mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Mobile button clicked via event listener!');
        connectMobile();
      });
    }
    
    // Setup insight button listeners as backup to onclick
    const analyzeBtn = document.querySelector('button[onclick="generateInsights()"]');
    const connectionsBtn = document.querySelector('button[onclick="findConnections()"]');
    
    if (analyzeBtn) {
      console.log('✅ Analyze Patterns button found, attaching listener');
      analyzeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Analyze Patterns button clicked via event listener!');
        generateInsights();
      });
    } else {
      console.log('❌ Analyze Patterns button not found');
    }
    
    if (connectionsBtn) {
      console.log('✅ Find Connections button found, attaching listener');
      connectionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Find Connections button clicked via event listener!');
        findConnections();
      });
    } else {
      console.log('❌ Find Connections button not found');
    }
  }, 500);
}

// Load memories from Chrome storage
async function loadMemories() {
  try {
    const result = await chrome.storage.local.get(['memories']);
    if (result.memories) {
      memories = new Map(Object.entries(result.memories));
      console.log(`Loaded ${memories.size} memories from storage`);
    }
  } catch (error) {
    console.error('Failed to load memories:', error);
  }
}

// Save memories to Chrome storage
async function saveMemories() {
  try {
    const memoriesObj = Object.fromEntries(memories);
    await chrome.storage.local.set({ memories: memoriesObj });
    console.log(`Saved ${memories.size} memories to storage`);
  } catch (error) {
    console.error('Failed to save memories:', error);
  }
}

// Create a new memory (Enhanced multimodal support)
function createMemory(title, content, category = 'personal', tags = [], type = 'text', mediaData = null, metadata = {}) {
  const memory = {
    id: generateMemoryId(),
    title: title.trim(),
    content: content.trim(),
    category: category,
    tags: tags,
    type: type, // text, image, audio, video, screenshot
    mediaData: mediaData, // Base64 or URL for media
    metadata: metadata, // Additional data like transcription, caption, face tags
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
    lastAccessed: null,
    embedding: null // For semantic search (future enhancement)
  };
  
  memories.set(memory.id, memory);
  saveMemories();
  return memory;
}

// Generate unique memory ID
function generateMemoryId() {
  return 'memory_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Update existing memory
function updateMemory(memoryId, updates) {
  const memory = memories.get(memoryId);
  if (!memory) return null;
  
  const updatedMemory = {
    ...memory,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  memories.set(memoryId, updatedMemory);
  saveMemories();
  return updatedMemory;
}

// Delete memory
function deleteMemory(memoryId) {
  const deleted = memories.delete(memoryId);
  if (deleted) {
    saveMemories();
    renderMemories();
  }
  return deleted;
}

// Access memory (increment access count)
function accessMemory(memoryId) {
  const memory = memories.get(memoryId);
  if (memory) {
    memory.accessCount++;
    memory.lastAccessed = new Date().toISOString();
    memories.set(memoryId, memory);
    saveMemories();
  }
}

// Search memories (Enhanced with semantic search capability)
async function searchMemories(query) {
  if (!query.trim()) return Array.from(memories.values());
  
  const searchTerm = query.toLowerCase();
  
  // Basic text search (existing)
  const textResults = Array.from(memories.values()).filter(memory => 
    memory.title.toLowerCase().includes(searchTerm) ||
    memory.content.toLowerCase().includes(searchTerm) ||
    memory.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
  
  // Try semantic search if Chrome AI is available
  if (window.ai && window.ai.languageModel) {
    try {
      const semanticResults = await semanticSearchMemories(query);
      // Merge and deduplicate results
      const allResults = [...textResults];
      semanticResults.forEach(semantic => {
        if (!allResults.find(r => r.id === semantic.id)) {
          allResults.push(semantic);
        }
      });
      return allResults;
    } catch (error) {
      console.log('Semantic search not available, using text search only');
    }
  }
  
  return textResults;
}

// Semantic search using Chrome AI (Memory Palace inspired)
async function semanticSearchMemories(query) {
  try {
    const session = await window.ai.languageModel.create({
      temperature: 0.3,
      topK: 5
    });
    
    // Ask AI to find relevant memories
    const memoriesContext = Array.from(memories.values())
      .map((m, i) => `[${i}] ${m.title}: ${m.content.substring(0, 150)}`)
      .join('\n');
    
    const prompt = `Given these memories:\n${memoriesContext}\n\nWhich memories are most relevant to: "${query}"?\nReturn only the numbers in square brackets, comma-separated.`;
    
    const response = await session.prompt(prompt);
    
    // Parse response to get memory indices
    const indices = response.match(/\d+/g)?.map(Number) || [];
    const memoryArray = Array.from(memories.values());
    
    return indices
      .filter(i => i < memoryArray.length)
      .map(i => memoryArray[i]);
      
  } catch (error) {
    console.error('Semantic search failed:', error);
    return [];
  }
}

// Filter memories by category
function filterMemories(category) {
  if (category === 'all') return Array.from(memories.values());
  return Array.from(memories.values()).filter(memory => memory.category === category);
}

// Handle memory search (Updated for async semantic search)
async function handleMemorySearch(e) {
  searchQuery = e.target.value;
  await renderMemories();
}

// Update memory count display (UX Law: Peak-End Rule + Von Restorff Effect)
function updateMemoryCount() {
  const countEl = document.getElementById('memoryCount');
  const imageCountEl = document.getElementById('imageCount');
  const videoCountEl = document.getElementById('videoCount');
  
  if (countEl) {
    const count = memories.size;
    countEl.textContent = count;
    
    // Animate count change
    countEl.style.transform = 'scale(1.2)';
    setTimeout(() => {
      countEl.style.transform = 'scale(1)';
    }, 200);
  }
  
  // Count images and videos separately
  if (imageCountEl) {
    const imageCount = Array.from(memories.values()).filter(m => 
      m.type === 'image' || m.type === 'screenshot'
    ).length;
    imageCountEl.textContent = imageCount;
  }
  
  if (videoCountEl) {
    const videoCount = Array.from(memories.values()).filter(m => 
      m.type === 'video'
    ).length;
    videoCountEl.textContent = videoCount;
  }
}

// Render memories in the UI (Updated for async search)
async function renderMemories() {
  const memoryList = document.getElementById('memoryList');
  const emptyState = document.getElementById('memoryEmptyState');
  
  if (!memoryList) return;
  
  // Update memory count
  updateMemoryCount();
  
  // Get filtered memories
  let filteredMemories = filterMemories(currentFilter);
  
  // Apply search if there's a query
  if (searchQuery.trim()) {
    filteredMemories = await searchMemories(searchQuery);
  }
  
  // Sort by last updated (most recent first)
  filteredMemories.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  
  // Clear current content
  memoryList.innerHTML = '';
  
  if (filteredMemories.length === 0) {
    // Show empty state
    if (searchQuery.trim()) {
      memoryList.innerHTML = `
        <div class="memory-empty-state">
          <div class="empty-icon">🔍</div>
          <h3>No memories found</h3>
          <p>No memories match your search for "${searchQuery}"</p>
          <button class="clear-search-btn" onclick="clearMemorySearch()">Clear Search</button>
        </div>
      `;
    } else if (currentFilter !== 'all') {
      memoryList.innerHTML = `
        <div class="memory-empty-state">
          <div class="empty-icon">${MEMORY_CATEGORIES[currentFilter]?.icon || '📝'}</div>
          <h3>No ${currentFilter} memories</h3>
          <p>You haven't added any ${currentFilter} memories yet.</p>
          <button class="add-first-memory-btn" onclick="showAddMemoryModal('${currentFilter}')">
            Add ${currentFilter} Memory
          </button>
        </div>
      `;
    } else {
      emptyState.style.display = 'block';
    }
    return;
  }
  
  // Hide empty state
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Render memory items
  filteredMemories.forEach(memory => {
    const memoryItem = createMemoryElement(memory);
    memoryList.appendChild(memoryItem);
  });
}

// Create memory element
function createMemoryElement(memory) {
  const category = MEMORY_CATEGORIES[memory.category] || MEMORY_CATEGORIES.personal;
  const timeAgo = getTimeAgo(memory.updatedAt);
  const memoryType = memory.type || 'text';
  const typeInfo = MEMORY_TYPES[memoryType] || MEMORY_TYPES.text;
  
  const memoryDiv = document.createElement('div');
  memoryDiv.className = 'memory-item';
  memoryDiv.dataset.memoryId = memory.id;
  
  // Check if memory has media content to display
  const hasMedia = memory.mediaData && (memoryType === 'image' || memoryType === 'screenshot');
  
  memoryDiv.innerHTML = `
    <div class="memory-header">
      <div class="memory-category" style="background: ${category.color}20; color: ${category.color};">
        <span class="category-icon">${category.icon}</span>
        <span class="category-name">${category.name}</span>
      </div>
      ${memoryType !== 'text' ? `<span class="memory-type-badge ${memoryType}">${typeInfo.icon} ${typeInfo.name}</span>` : ''}
      <div class="memory-actions">
        <button class="memory-action-btn" onclick="editMemory('${memory.id}')" title="Edit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
        </button>
        <button class="memory-action-btn" onclick="copyMemory('${memory.id}')" title="Copy">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        </button>
        <button class="memory-action-btn danger" onclick="confirmDeleteMemory('${memory.id}')" title="Delete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
        </button>
      </div>
    </div>
    ${hasMedia ? `
      <div class="memory-image-preview" onclick="accessMemory('${memory.id}'); expandMemory('${memory.id}')">
        <img src="${memory.mediaData}" alt="${escapeHtml(memory.title)}" loading="lazy">
      </div>
    ` : ''}
    <div class="memory-content" onclick="accessMemory('${memory.id}'); expandMemory('${memory.id}')">
      <h4 class="memory-title">${escapeHtml(memory.title)}</h4>
      <p class="memory-text">${escapeHtml(memory.content.substring(0, 150))}${memory.content.length > 150 ? '...' : ''}</p>
      ${memory.tags.length > 0 ? `
        <div class="memory-tags">
          ${memory.tags.map(tag => `<span class="memory-tag">#${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
    </div>
    <div class="memory-footer">
      <span class="memory-time">${timeAgo}</span>
      ${memory.metadata?.filesize ? `
        <span class="memory-file-size">${formatFileSize(memory.metadata.filesize)}</span>
      ` : ''}
      <span class="memory-stats">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        ${memory.accessCount}
      </span>
    </div>
  `;
  
  return memoryDiv;
}

// Format file size for display
function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// Show add memory modal
function showAddMemoryModal(defaultCategory = 'personal') {
  const modal = createAddMemoryModal(defaultCategory);
  document.body.appendChild(modal);
  
  // Setup close button listener
  setTimeout(() => {
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Close button clicked');
        closeAddMemoryModal();
      });
    }
    
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Overlay clicked');
        closeAddMemoryModal();
      });
    }
  }, 100);
  
  // Focus on title input
  const titleInput = modal.querySelector('#memoryTitleInput');
  if (titleInput) {
    titleInput.focus();
  }
}

// Create add memory modal
function createAddMemoryModal(defaultCategory = 'personal') {
  const modal = document.createElement('div');
  modal.className = 'memory-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeAddMemoryModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Add New Memory</h3>
        <button class="modal-close" onclick="closeAddMemoryModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="memoryTitleInput">Title</label>
          <input type="text" id="memoryTitleInput" placeholder="Enter memory title..." maxlength="100">
        </div>
        <div class="form-group">
          <label for="memoryCategorySelect">Category</label>
          <select id="memoryCategorySelect">
            ${Object.entries(MEMORY_CATEGORIES).map(([key, cat]) => 
              `<option value="${key}" ${key === defaultCategory ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="memoryContentInput">Content</label>
          <textarea id="memoryContentInput" placeholder="Enter your memory content..." rows="6"></textarea>
        </div>
        <div class="form-group">
          <label for="memoryTagsInput">Tags (optional)</label>
          <input type="text" id="memoryTagsInput" placeholder="Enter tags separated by commas...">
          <small>e.g., important, project, meeting</small>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeAddMemoryModal()">Cancel</button>
        <button class="btn-primary" onclick="saveNewMemory()">Save Memory</button>
      </div>
    </div>
  `;
  
  return modal;
}

// Close add memory modal
function closeAddMemoryModal() {
  console.log('Closing add memory modal');
  const modal = document.querySelector('.memory-modal');
  if (modal) {
    modal.remove();
  }
}

// Save new memory
function saveNewMemory() {
  const title = document.getElementById('memoryTitleInput')?.value.trim();
  const content = document.getElementById('memoryContentInput')?.value.trim();
  const category = document.getElementById('memoryCategorySelect')?.value || 'personal';
  const tagsInput = document.getElementById('memoryTagsInput')?.value.trim();
  
  if (!title || !content) {
    alert('Please enter both title and content for the memory.');
    return;
  }
  
  // Parse tags
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  
  // Create memory
  const memory = createMemory(title, content, category, tags);
  
  // Close modal
  closeAddMemoryModal();
  
  // Re-render memories
  renderMemories();
  
  // Show success message
  showMemoryToast(`Memory "${memory.title}" saved successfully!`, 'success');
}

// Edit memory
function editMemory(memoryId) {
  const memory = memories.get(memoryId);
  if (!memory) return;
  
  const modal = createEditMemoryModal(memory);
  document.body.appendChild(modal);
  
  // Setup close button listeners
  setTimeout(() => {
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        closeEditMemoryModal();
      });
    }
    
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        closeEditMemoryModal();
      });
    }
  }, 100);
  
  // Focus on title input
  const titleInput = modal.querySelector('#editMemoryTitleInput');
  if (titleInput) {
    titleInput.focus();
  }
}

// Create edit memory modal
function createEditMemoryModal(memory) {
  const modal = document.createElement('div');
  modal.className = 'memory-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeEditMemoryModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h3>Edit Memory</h3>
        <button class="modal-close" onclick="closeEditMemoryModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="form-group">
          <label for="editMemoryTitleInput">Title</label>
          <input type="text" id="editMemoryTitleInput" value="${escapeHtml(memory.title)}" maxlength="100">
        </div>
        <div class="form-group">
          <label for="editMemoryCategorySelect">Category</label>
          <select id="editMemoryCategorySelect">
            ${Object.entries(MEMORY_CATEGORIES).map(([key, cat]) => 
              `<option value="${key}" ${key === memory.category ? 'selected' : ''}>${cat.icon} ${cat.name}</option>`
            ).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="editMemoryContentInput">Content</label>
          <textarea id="editMemoryContentInput" rows="6">${escapeHtml(memory.content)}</textarea>
        </div>
        <div class="form-group">
          <label for="editMemoryTagsInput">Tags (optional)</label>
          <input type="text" id="editMemoryTagsInput" value="${memory.tags.join(', ')}" placeholder="Enter tags separated by commas...">
          <small>e.g., important, project, meeting</small>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeEditMemoryModal()">Cancel</button>
        <button class="btn-primary" onclick="saveEditedMemory('${memory.id}')">Save Changes</button>
      </div>
    </div>
  `;
  
  return modal;
}

// Close edit memory modal
function closeEditMemoryModal() {
  const modal = document.querySelector('.memory-modal');
  if (modal) {
    modal.remove();
  }
}

// Save edited memory
function saveEditedMemory(memoryId) {
  const title = document.getElementById('editMemoryTitleInput')?.value.trim();
  const content = document.getElementById('editMemoryContentInput')?.value.trim();
  const category = document.getElementById('editMemoryCategorySelect')?.value || 'personal';
  const tagsInput = document.getElementById('editMemoryTagsInput')?.value.trim();
  
  if (!title || !content) {
    alert('Please enter both title and content for the memory.');
    return;
  }
  
  // Parse tags
  const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
  
  // Update memory
  const updatedMemory = updateMemory(memoryId, { title, content, category, tags });
  
  if (updatedMemory) {
    // Close modal
    closeEditMemoryModal();
    
    // Re-render memories
    renderMemories();
    
    // Show success message
    showMemoryToast(`Memory "${updatedMemory.title}" updated successfully!`, 'success');
  }
}

// Copy memory to clipboard
async function copyMemory(memoryId) {
  const memory = memories.get(memoryId);
  if (!memory) return;
  
  const text = `${memory.title}\n\n${memory.content}`;
  
  try {
    await navigator.clipboard.writeText(text);
    showMemoryToast('Memory copied to clipboard!', 'success');
  } catch (error) {
    console.error('Failed to copy memory:', error);
    showMemoryToast('Failed to copy memory', 'error');
  }
}

// Confirm delete memory
function confirmDeleteMemory(memoryId) {
  const memory = memories.get(memoryId);
  if (!memory) return;
  
  if (confirm(`Are you sure you want to delete the memory "${memory.title}"? This action cannot be undone.`)) {
    deleteMemory(memoryId);
    showMemoryToast('Memory deleted successfully', 'success');
  }
}

// Expand memory (show full content)
function expandMemory(memoryId) {
  const memory = memories.get(memoryId);
  if (!memory) return;
  
  const modal = createExpandMemoryModal(memory);
  document.body.appendChild(modal);
  
  // Setup close button listeners
  setTimeout(() => {
    const closeBtn = modal.querySelector('.modal-close');
    const overlay = modal.querySelector('.modal-overlay');
    
    if (closeBtn) {
      console.log('Setting up close button for expand modal');
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Expand modal close button clicked');
        closeExpandMemoryModal();
      });
    }
    
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Expand modal overlay clicked');
        closeExpandMemoryModal();
      });
    }
  }, 100);
}

// Create expand memory modal
function createExpandMemoryModal(memory) {
  const category = MEMORY_CATEGORIES[memory.category] || MEMORY_CATEGORIES.personal;
  const timeAgo = getTimeAgo(memory.updatedAt);
  const memoryType = memory.type || 'text';
  const typeInfo = MEMORY_TYPES[memoryType] || MEMORY_TYPES.text;
  const hasMedia = memory.mediaData && (memoryType === 'image' || memoryType === 'screenshot');
  
  const modal = document.createElement('div');
  modal.className = 'memory-modal expand-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeExpandMemoryModal()"></div>
    <div class="modal-content ${hasMedia ? 'has-media' : ''}">
      <div class="modal-header">
        <div class="memory-category" style="background: ${category.color}20; color: ${category.color};">
          <span class="category-icon">${category.icon}</span>
          <span class="category-name">${category.name}</span>
        </div>
        ${memoryType !== 'text' ? `<span class="memory-type-badge ${memoryType}">${typeInfo.icon} ${typeInfo.name}</span>` : ''}
        <button class="modal-close" onclick="closeExpandMemoryModal()">×</button>
      </div>
      <div class="modal-body">
        <h2 class="memory-title">${escapeHtml(memory.title)}</h2>
        <div class="memory-meta">
          <span>Created: ${new Date(memory.createdAt).toLocaleDateString()}</span>
          <span>Updated: ${timeAgo}</span>
          <span>Views: ${memory.accessCount}</span>
          ${memory.metadata?.filesize ? `<span>Size: ${formatFileSize(memory.metadata.filesize)}</span>` : ''}
        </div>
        ${memory.tags.length > 0 ? `
          <div class="memory-tags">
            ${memory.tags.map(tag => `<span class="memory-tag">#${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
        ${hasMedia ? `
          <div class="memory-full-image">
            <img src="${memory.mediaData}" alt="${escapeHtml(memory.title)}">
          </div>
        ` : ''}
        <div class="memory-content-full">
          ${escapeHtml(memory.content).replace(/\n/g, '<br>')}
        </div>
        ${memory.metadata?.context ? `
          <div class="memory-context-info">
            <div class="context-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              Context:
            </div>
            <div class="context-details">
              ${memory.metadata.context.url ? `
                <a href="${memory.metadata.context.url}" target="_blank" rel="noopener">
                  ${memory.metadata.context.title || memory.metadata.context.url}
                </a>
              ` : ''}
              ${memory.metadata.context.timestamp ? `
                <span class="context-time">${new Date(memory.metadata.context.timestamp).toLocaleString()}</span>
              ` : ''}
            </div>
          </div>
        ` : ''}
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="copyMemory('${memory.id}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </button>
        <button class="btn-secondary" onclick="editMemory('${memory.id}'); closeExpandMemoryModal();">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9"/>
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
          </svg>
          Edit
        </button>
        <button class="btn-primary" onclick="closeExpandMemoryModal()">Close</button>
      </div>
    </div>
  `;
  
  return modal;
}

// Close expand memory modal
function closeExpandMemoryModal() {
  const modal = document.querySelector('.expand-modal');
  if (modal) {
    modal.remove();
  }
}

// Clear memory search
function clearMemorySearch() {
  const searchInput = document.getElementById('memorySearch');
  if (searchInput) {
    searchInput.value = '';
    searchQuery = '';
    renderMemories();
  }
}

// Import memories
function importMemories() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = handleMemoryImport;
  input.click();
}

// Handle memory import
function handleMemoryImport(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      
      if (importedData.memories && Array.isArray(importedData.memories)) {
        let importCount = 0;
        
        importedData.memories.forEach(memoryData => {
          if (memoryData.title && memoryData.content) {
            const memory = createMemory(
              memoryData.title,
              memoryData.content,
              memoryData.category || 'personal',
              memoryData.tags || []
            );
            importCount++;
          }
        });
        
        renderMemories();
        showMemoryToast(`Successfully imported ${importCount} memories!`, 'success');
      } else {
        showMemoryToast('Invalid file format. Please select a valid memory export file.', 'error');
      }
    } catch (error) {
      console.error('Import error:', error);
      showMemoryToast('Failed to import memories. Please check the file format.', 'error');
    }
  };
  
  reader.readAsText(file);
}

// Export memories
function exportMemories() {
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    memories: Array.from(memories.values())
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `memories-export-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
  showMemoryToast('Memories exported successfully!', 'success');
}

// Show memory toast notification
function showMemoryToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `memory-toast ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Animate in
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remove after delay
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getTimeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}

// Cleanup function
function cleanupMemory() {
  // Close any open modals
  const modals = document.querySelectorAll('.memory-modal');
  modals.forEach(modal => modal.remove());
  
  // Clear any active timers or intervals
  // (none in this implementation)
}

// ============================================
// ENHANCED FEATURES (Memory Palace Inspired)
// ============================================

// Proactive Memory Surfacing - suggest relevant memories based on context
async function suggestRelevantMemories() {
  try {
    // Get current tab context
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return [];
    
    const context = {
      url: tab.url,
      title: tab.title,
      domain: new URL(tab.url).hostname
    };
    
    // Find memories related to current context
    const relevantMemories = Array.from(memories.values()).filter(memory => {
      // Check if memory has context metadata
      if (memory.metadata?.context) {
        const memoryDomain = memory.metadata.context.url ? 
          new URL(memory.metadata.context.url).hostname : null;
        
        // Match by domain
        if (memoryDomain === context.domain) return true;
      }
      
      // Match by keywords in title
      const keywords = context.title.toLowerCase().split(' ');
      const titleMatch = keywords.some(keyword => 
        keyword.length > 3 && 
        (memory.title.toLowerCase().includes(keyword) || 
         memory.content.toLowerCase().includes(keyword))
      );
      
      return titleMatch;
    });
    
    // Sort by access count and recency
    relevantMemories.sort((a, b) => {
      const scoreA = a.accessCount + (new Date() - new Date(a.updatedAt)) / (1000 * 60 * 60 * 24);
      const scoreB = b.accessCount + (new Date() - new Date(b.updatedAt)) / (1000 * 60 * 60 * 24);
      return scoreB - scoreA;
    });
    
    return relevantMemories.slice(0, 5);
  } catch (error) {
    console.error('Error suggesting memories:', error);
    return [];
  }
}

// Show proactive memory suggestions
async function showMemorySuggestions() {
  const suggestions = await suggestRelevantMemories();
  
  if (suggestions.length === 0) return;
  
  // Create suggestions panel
  const suggestionsPanel = document.getElementById('memorySuggestionsPanel');
  if (!suggestionsPanel) return;
  
  suggestionsPanel.innerHTML = `
    <div class="suggestions-header">
      <span class="suggestions-icon">💡</span>
      <span>Related Memories</span>
      <button class="close-suggestions" onclick="closeMemorySuggestions()">×</button>
    </div>
    <div class="suggestions-list">
      ${suggestions.map(memory => `
        <div class="suggestion-item" onclick="accessMemory('${memory.id}'); expandMemory('${memory.id}')">
          <div class="suggestion-title">${escapeHtml(memory.title)}</div>
          <div class="suggestion-preview">${escapeHtml(memory.content.substring(0, 80))}...</div>
        </div>
      `).join('')}
    </div>
  `;
  
  suggestionsPanel.style.display = 'block';
}

// Close memory suggestions
function closeMemorySuggestions() {
  const suggestionsPanel = document.getElementById('memorySuggestionsPanel');
  if (suggestionsPanel) {
    suggestionsPanel.style.display = 'none';
  }
}

// Capture screenshot memory (Enhanced with visual feedback)
async function captureScreenshotMemory() {
  console.log('📸 Screenshot button clicked!');
  try {
    // Show feedback
    showActionFeedback('📸', 'Capturing screenshot...', 'progress');
    
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    updateActionFeedback('📸', 'Taking snapshot...', 30);
    
    // Capture visible tab
    const screenshotUrl = await chrome.tabs.captureVisibleTab(null, {
      format: 'png'
    });
    
    updateActionFeedback('🤖', 'Generating AI caption...', 60);
    
    // Generate caption using AI if available
    let caption = `Screenshot from ${tab.title}`;
    if (window.ai && window.ai.languageModel) {
      try {
        const session = await window.ai.languageModel.create();
        const aiCaption = await session.prompt(
          `Generate a brief caption for a screenshot taken from a webpage titled: "${tab.title}" at URL: ${tab.url}`
        );
        caption = aiCaption;
      } catch (error) {
        console.log('AI caption generation failed, using default');
      }
    }
    
    updateActionFeedback('💾', 'Saving memory...', 90);
    
    // Create memory with screenshot
    const memory = createMemory(
      `Screenshot - ${tab.title}`,
      caption,
      'personal',
      ['screenshot', 'auto-capture'],
      'screenshot',
      screenshotUrl,
      {
        context: {
          url: tab.url,
          title: tab.title,
          timestamp: new Date().toISOString()
        }
      }
    );
    
    updateActionFeedback('✅', 'Screenshot saved!', 100);
    
    setTimeout(() => {
      hideActionFeedback();
      showMemoryToast('Screenshot saved to memories!', 'success');
    }, 1000);
    
    await renderMemories();
    
    return memory;
  } catch (error) {
    console.error('Failed to capture screenshot:', error);
    showActionFeedback('❌', 'Failed to capture screenshot', 100, 'error');
    setTimeout(hideActionFeedback, 2000);
    return null;
  }
}

// Record voice note memory
async function recordVoiceNote() {
  try {
    showMemoryToast('Voice recording feature coming soon!', 'info');
    
    // Future implementation:
    // 1. Request microphone permission
    // 2. Use MediaRecorder API to record audio
    // 3. Optionally transcribe using Web Speech API
    // 4. Create audio memory with transcription metadata
    
  } catch (error) {
    console.error('Failed to record voice note:', error);
    showMemoryToast('Failed to record voice note', 'error');
  }
}

// Find related memories (Memory Palace inspired)
async function findRelatedMemories(memoryId) {
  const memory = memories.get(memoryId);
  if (!memory) return { similar: [], tagged: [], temporal: [] };
  
  // Find memories with same tags
  const tagged = Array.from(memories.values()).filter(m => 
    m.id !== memoryId &&
    m.tags.some(tag => memory.tags.includes(tag))
  ).slice(0, 5);
  
  // Find memories from same time period (within 7 days)
  const memoryDate = new Date(memory.createdAt);
  const temporal = Array.from(memories.values()).filter(m => {
    if (m.id === memoryId) return false;
    const mDate = new Date(m.createdAt);
    const diffDays = Math.abs(memoryDate - mDate) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  }).slice(0, 5);
  
  // Try semantic search for similar content
  let similar = [];
  try {
    similar = await semanticSearchMemories(memory.content.substring(0, 100));
    similar = similar.filter(m => m.id !== memoryId).slice(0, 5);
  } catch (error) {
    console.log('Semantic similarity search not available');
  }
  
  return { similar, tagged, temporal };
}

// Auto-suggest creating memory for important pages
async function shouldSuggestMemoryCreation(tab) {
  // Suggest for certain domains or page types
  const importantDomains = ['github.com', 'stackoverflow.com', 'docs.', 'wikipedia.org'];
  const url = new URL(tab.url);
  
  return importantDomains.some(domain => url.hostname.includes(domain));
}

// ============================================
// VIDEO RECORDING
// ============================================

// Record video memory
async function recordVideoMemory() {
  console.log('🎬 Video button clicked!');
  try {
    showActionFeedback('🎬', 'Starting video recording...', 'progress');
    
    // Request screen capture
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { mediaSource: 'screen' },
      audio: true
    });
    
    updateActionFeedback('⏺️', 'Recording in progress...', 30);
    
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    
    mediaRecorder.onstop = async () => {
      updateActionFeedback('💾', 'Processing video...', 80);
      
      const blob = new Blob(chunks, { type: 'video/webm' });
      const videoUrl = URL.createObjectURL(blob);
      
      // Get current tab info
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Create memory with video
      const reader = new FileReader();
      reader.onload = async (e) => {
        const memory = createMemory(
          `Video Recording - ${new Date().toLocaleString()}`,
          `Screen recording from ${tab.title}`,
          'personal',
          ['video', 'recording', 'screen-capture'],
          'video',
          e.target.result,
          {
            context: {
              url: tab.url,
              title: tab.title,
              timestamp: new Date().toISOString()
            },
            duration: 'Unknown', // Could be calculated
            filesize: blob.size
          }
        );
        
        updateActionFeedback('✅', 'Video saved!', 100);
        
        setTimeout(() => {
          hideActionFeedback();
          showMemoryToast('Video recording saved to memories!', 'success');
        }, 1000);
        
        await renderMemories();
      };
      
      reader.readAsDataURL(blob);
    };
    
    // Show recording UI
    showRecordingControls(mediaRecorder, stream);
    
    mediaRecorder.start();
    
  } catch (error) {
    console.error('Failed to record video:', error);
    showActionFeedback('❌', 'Recording cancelled or failed', 100, 'error');
    setTimeout(hideActionFeedback, 2000);
  }
}

// Show recording controls
function showRecordingControls(mediaRecorder, stream) {
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'recording-controls';
  controlsDiv.innerHTML = `
    <div class="recording-status">
      <div class="recording-indicator"></div>
      <span class="recording-text">Recording...</span>
      <span class="recording-time" id="recordingTime">0:00</span>
    </div>
    <button class="stop-recording-btn" id="stopRecordingBtn">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <rect x="6" y="6" width="12" height="12"/>
      </svg>
      Stop Recording
    </button>
  `;
  
  const feedback = document.getElementById('memoryActionFeedback');
  if (feedback) {
    feedback.appendChild(controlsDiv);
  }
  
  // Timer
  let seconds = 0;
  const timer = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const timeEl = document.getElementById('recordingTime');
    if (timeEl) {
      timeEl.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    }
  }, 1000);
  
  // Stop button
  document.getElementById('stopRecordingBtn')?.addEventListener('click', () => {
    clearInterval(timer);
    mediaRecorder.stop();
    stream.getTracks().forEach(track => track.stop());
    controlsDiv.remove();
  });
}

// ============================================
// BARCODE/QR CODE SCANNING
// ============================================

// Scan barcode or QR code
async function scanBarcode() {
  console.log('📷 Barcode scanner activated!');
  try {
    showActionFeedback('📷', 'Starting barcode scanner...', 'progress');
    
    const modal = createBarcodeScannerModal();
    document.body.appendChild(modal);
    
    // Setup modal listeners
    setTimeout(() => {
      const closeBtn = modal.querySelector('.modal-close');
      const overlay = modal.querySelector('.modal-overlay');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeBarcodeScanner();
        });
      }
      
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          e.stopPropagation();
          closeBarcodeScanner();
        });
      }
      
      // Start camera
      startBarcodeScanner();
    }, 100);
    
    hideActionFeedback();
    
  } catch (error) {
    console.error('Failed to start barcode scanner:', error);
    showActionFeedback('❌', 'Camera access denied', 100, 'error');
    setTimeout(hideActionFeedback, 2000);
  }
}

// Create barcode scanner modal
function createBarcodeScannerModal() {
  const modal = document.createElement('div');
  modal.className = 'memory-modal barcode-scanner-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeBarcodeScanner()"></div>
    <div class="modal-content scanner-content">
      <div class="modal-header">
        <div class="scanner-header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
            <rect x="9" y="9" width="6" height="6"/>
          </svg>
          <h3>Scan Barcode or QR Code</h3>
        </div>
        <button class="modal-close" onclick="closeBarcodeScanner()">×</button>
      </div>
      <div class="modal-body scanner-body">
        <div class="scanner-info">
          <p>Point your camera at a barcode or QR code</p>
        </div>
        <div class="scanner-view">
          <video id="barcodeVideo" autoplay playsinline></video>
          <canvas id="barcodeCanvas" style="display:none;"></canvas>
          <div class="scanner-overlay">
            <div class="scanner-frame"></div>
          </div>
          <div class="scanner-status" id="scannerStatus">Looking for code...</div>
        </div>
        <div class="scanner-result" id="scannerResult" style="display:none;">
          <div class="result-icon">✅</div>
          <div class="result-text" id="resultText"></div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeBarcodeScanner()">Cancel</button>
        <button class="btn-primary" id="saveScanResultBtn" style="display:none;" onclick="saveScanResult()">
          Save to Memories
        </button>
      </div>
    </div>
  `;
  
  return modal;
}

let barcodeStream = null;
let scanResult = null;

// Start barcode scanner
async function startBarcodeScanner() {
  try {
    const video = document.getElementById('barcodeVideo');
    if (!video) return;
    
    // Request camera access
    barcodeStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    });
    
    video.srcObject = barcodeStream;
    
    // Note: Real barcode scanning would require a library like jsQR or ZXing
    // For now, show a "coming soon" message after a delay
    setTimeout(() => {
      const status = document.getElementById('scannerStatus');
      if (status) {
        status.innerHTML = '📱 <strong>Barcode scanning coming soon!</strong><br>Will support QR codes, UPC, EAN, and more';
        status.style.background = 'rgba(102, 126, 234, 0.9)';
        status.style.color = 'white';
      }
    }, 2000);
    
  } catch (error) {
    console.error('Camera access failed:', error);
    const status = document.getElementById('scannerStatus');
    if (status) {
      status.textContent = 'Camera access denied. Please allow camera permission.';
      status.style.background = 'rgba(234, 67, 53, 0.9)';
      status.style.color = 'white';
    }
  }
}

// Close barcode scanner
function closeBarcodeScanner() {
  const modal = document.querySelector('.barcode-scanner-modal');
  if (modal) {
    modal.remove();
  }
  
  // Stop camera stream
  if (barcodeStream) {
    barcodeStream.getTracks().forEach(track => track.stop());
    barcodeStream = null;
  }
}

// Save scan result
function saveScanResult() {
  if (!scanResult) return;
  
  const memory = createMemory(
    `Scanned Code - ${new Date().toLocaleString()}`,
    scanResult,
    'personal',
    ['barcode', 'scanned'],
    'text',
    null,
    { scannedAt: new Date().toISOString() }
  );
  
  showMemoryToast('Scan result saved to memories!', 'success');
  closeBarcodeScanner();
  renderMemories();
}

// ============================================
// MOBILE UPLOAD CONNECTION
// ============================================

// Connect mobile device for upload
async function connectMobile() {
  console.log('📱 Mobile upload activated!');
  try {
    showActionFeedback('📱', 'Generating QR code...', 'progress');
    
    const modal = createMobileUploadModal();
    document.body.appendChild(modal);
    
    // Setup modal listeners
    setTimeout(() => {
      const closeBtn = modal.querySelector('.modal-close');
      const overlay = modal.querySelector('.modal-overlay');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeMobileUpload();
        });
      }
      
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          e.stopPropagation();
          closeMobileUpload();
        });
      }
      
      // Generate QR code
      generateUploadQRCode();
    }, 100);
    
    hideActionFeedback();
    
  } catch (error) {
    console.error('Failed to create mobile upload:', error);
    showActionFeedback('❌', 'Failed to create upload link', 100, 'error');
    setTimeout(hideActionFeedback, 2000);
  }
}

// Create mobile upload modal
function createMobileUploadModal() {
  const modal = document.createElement('div');
  modal.className = 'memory-modal mobile-upload-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-content mobile-upload-content">
      <div class="modal-header">
        <div class="mobile-header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
          </svg>
          <h3>Upload from Mobile</h3>
        </div>
        <button class="modal-close">×</button>
      </div>
      <div class="modal-body mobile-upload-body">
        <div class="mobile-info">
          <div class="mobile-info-icon">📱</div>
          <h4>Scan QR Code with Your Phone</h4>
          <p>Scan this code to upload memories directly from your mobile device</p>
        </div>
        
        <div class="qr-code-container" id="qrCodeContainer">
          <div class="qr-code-placeholder">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <rect x="10" y="10" width="180" height="180" fill="white" stroke="#ccc" stroke-width="2"/>
              <rect x="20" y="20" width="50" height="50" fill="#667eea"/>
              <rect x="130" y="20" width="50" height="50" fill="#667eea"/>
              <rect x="20" y="130" width="50" height="50" fill="#667eea"/>
              <circle cx="100" cy="100" r="20" fill="#764ba2"/>
              <text x="100" y="105" text-anchor="middle" fill="white" font-size="12" font-weight="bold">QR</text>
            </svg>
          </div>
          <div class="qr-code-loading">
            <div class="loading-spinner"></div>
            <p>Generating secure upload link...</p>
          </div>
        </div>
        
        <div class="mobile-instructions">
          <h4>How it works:</h4>
          <ol>
            <li>Open camera app on your phone</li>
            <li>Scan the QR code above</li>
            <li>Upload photos/videos from your phone</li>
            <li>They'll appear here instantly!</li>
          </ol>
        </div>
        
        <div class="mobile-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>Secure end-to-end connection. All data stays on your local network.</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeMobileUpload()">Close</button>
      </div>
    </div>
  `;
  
  return modal;
}

// Generate QR code for upload
function generateUploadQRCode() {
  // In a real implementation, you would:
  // 1. Start a local WebSocket server
  // 2. Generate a unique upload URL
  // 3. Create QR code with that URL
  // 4. Phone scans → Opens upload page
  // 5. Phone uploads → Extension receives files
  
  setTimeout(() => {
    const qrLoading = document.querySelector('.qr-code-loading');
    const placeholder = document.querySelector('.qr-code-placeholder');
    
    if (qrLoading) qrLoading.style.display = 'none';
    if (placeholder) {
      placeholder.style.display = 'block';
      
      // Show "coming soon" message
      const container = document.getElementById('qrCodeContainer');
      if (container) {
        container.innerHTML += `
          <div class="qr-coming-soon">
            <p><strong>🚀 Coming Soon!</strong></p>
            <p>Mobile upload feature is in development. For now, you can:</p>
            <ul>
              <li>✅ Use browser's mobile view</li>
              <li>✅ Upload from device storage</li>
              <li>✅ Email files to yourself</li>
            </ul>
          </div>
        `;
      }
    }
  }, 1500);
}

// Close mobile upload
function closeMobileUpload() {
  const modal = document.querySelector('.mobile-upload-modal');
  if (modal) {
    modal.remove();
  }
}

// ============================================
// GOOGLE DOCS INTEGRATION
// ============================================

// Connect to Google Docs
async function connectGoogleDocs() {
  console.log('📄 Google Docs button clicked!');
  try {
    showActionFeedback('📄', 'Opening Google Docs...', 'progress');
    
    const modal = createGoogleDocsModal();
    document.body.appendChild(modal);
    
    // Setup close button listeners
    setTimeout(() => {
      const closeBtn = modal.querySelector('.modal-close');
      const overlay = modal.querySelector('.modal-overlay');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeGoogleDocsModal();
        });
      }
      
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          e.stopPropagation();
          closeGoogleDocsModal();
        });
      }
    }, 100);
    
    hideActionFeedback();
    
  } catch (error) {
    console.error('Failed to connect to Google Docs:', error);
    showActionFeedback('❌', 'Failed to connect to Google Docs', 100, 'error');
    setTimeout(hideActionFeedback, 2000);
  }
}

// Create Google Docs modal
function createGoogleDocsModal() {
  const modal = document.createElement('div');
  modal.className = 'memory-modal google-docs-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeGoogleDocsModal()"></div>
    <div class="modal-content google-docs-content">
      <div class="modal-header">
        <div class="docs-header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#4285F4">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8" fill="#white"/>
          </svg>
          <h3>Import from Google Docs</h3>
        </div>
        <button class="modal-close" onclick="closeGoogleDocsModal()">×</button>
      </div>
      <div class="modal-body">
        <div class="docs-info">
          <div class="docs-info-icon">📄</div>
          <h4>Connect Your Documents</h4>
          <p>Import notes and documents from Google Docs to create text memories with full formatting.</p>
        </div>
        
        <div class="docs-options">
          <div class="docs-option-card">
            <div class="option-icon">📄</div>
            <div class="option-content">
              <strong>Select Document</strong>
              <span>Choose a specific Google Doc</span>
            </div>
          </div>
          <div class="docs-option-card">
            <div class="option-icon">📁</div>
            <div class="option-content">
              <strong>Import Folder</strong>
              <span>Import all docs from a folder</span>
            </div>
          </div>
          <div class="docs-option-card">
            <div class="option-icon">🔖</div>
            <div class="option-content">
              <strong>Bookmarks</strong>
              <span>Import your saved documents</span>
            </div>
          </div>
        </div>
        
        <div class="docs-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>Google Docs integration coming soon! You can add text memories manually for now.</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeGoogleDocsModal()">Cancel</button>
        <button class="btn-primary" onclick="showAddMemoryModal('notes'); closeGoogleDocsModal();">
          Add Text Memory Instead
        </button>
      </div>
    </div>
  `;
  
  return modal;
}

// Close Google Docs modal
function closeGoogleDocsModal() {
  const modal = document.querySelector('.google-docs-modal');
  if (modal) {
    modal.remove();
  }
}

// ============================================
// GOOGLE DRIVE INTEGRATION
// ============================================

// Connect to Google Drive and import photos
async function connectGoogleDrive() {
  console.log('📂 Google Drive button clicked!');
  try {
    showMemoryToast('Opening Google Drive...', 'info');
    
    // Create a modal for Google Drive import
    const modal = createGoogleDriveModal();
    document.body.appendChild(modal);
    
    // Setup close button listeners
    setTimeout(() => {
      const closeBtn = modal.querySelector('.modal-close');
      const overlay = modal.querySelector('.modal-overlay');
      
      if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          closeGoogleDriveModal();
        });
      }
      
      if (overlay) {
        overlay.addEventListener('click', (e) => {
          e.stopPropagation();
          closeGoogleDriveModal();
        });
      }
    }, 100);
    
  } catch (error) {
    console.error('Failed to connect to Google Drive:', error);
    showMemoryToast('Failed to connect to Google Drive', 'error');
  }
}

// Create Google Drive modal
function createGoogleDriveModal() {
  const modal = document.createElement('div');
  modal.className = 'memory-modal google-drive-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeGoogleDriveModal()"></div>
    <div class="modal-content google-drive-content">
      <div class="modal-header">
        <div class="drive-header-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M7.71 3.5L1.15 15l3.35 5.5h13L21 15 14.44 3.5z" fill="#0F9D58"/>
            <path d="M7.71 3.5h6.73L21 15h-6.56z" fill="#F4B400"/>
            <path d="M1.15 15l3.35 5.5 6.56-11.34z" fill="#4285F4"/>
          </svg>
          <h3>Import from Google Drive</h3>
        </div>
        <button class="modal-close" onclick="closeGoogleDriveModal()">×</button>
      </div>
      <div class="modal-body google-drive-body">
        <div class="drive-info">
          <div class="drive-info-icon">📂</div>
          <h4>Connect Your Photos</h4>
          <p>Import photos from Google Drive to create visual memories with AI-powered descriptions.</p>
        </div>
        
        <div class="drive-options">
          <div class="drive-option-card">
            <div class="option-icon">🖼️</div>
            <div class="option-content">
              <strong>Select Photos</strong>
              <span>Choose specific photos from your Drive</span>
            </div>
          </div>
          <div class="drive-option-card">
            <div class="option-icon">📁</div>
            <div class="option-content">
              <strong>Import Folder</strong>
              <span>Import all photos from a folder</span>
            </div>
          </div>
          <div class="drive-option-card">
            <div class="option-icon">⚡</div>
            <div class="option-content">
              <strong>Recent Photos</strong>
              <span>Import recently uploaded photos</span>
            </div>
          </div>
        </div>
        
        <div class="drive-upload-option">
          <div class="upload-divider">
            <span>OR</span>
          </div>
          <label for="localPhotoUpload" class="local-upload-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload from Local Device
          </label>
          <input type="file" id="localPhotoUpload" accept="image/*" multiple style="display: none;" onchange="handleLocalPhotoUpload(event)">
        </div>
        
        <div class="drive-note">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span>All photos are stored locally. No data is uploaded to external servers.</span>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-secondary" onclick="closeGoogleDriveModal()">Cancel</button>
        <button class="btn-primary" onclick="openGoogleDrivePicker()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 11l3 3L22 4"/>
            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
          </svg>
          Connect Google Drive
        </button>
      </div>
    </div>
  `;
  
  return modal;
}

// Close Google Drive modal
function closeGoogleDriveModal() {
  const modal = document.querySelector('.google-drive-modal');
  if (modal) {
    modal.remove();
  }
}

// Open Google Drive Picker
async function openGoogleDrivePicker() {
  try {
    // In a real implementation, you would:
    // 1. Load Google Picker API
    // 2. Authenticate with OAuth 2.0
    // 3. Open the picker to select photos
    // 4. Download selected photos
    // 5. Create memories with AI captions
    
    showMemoryToast('Google Drive integration coming soon! Use local upload for now.', 'info');
    
    // For now, show a message
    const modalBody = document.querySelector('.google-drive-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="drive-coming-soon">
          <div class="coming-soon-icon">🚀</div>
          <h3>Coming Soon!</h3>
          <p>Google Drive integration is in development. For now, you can:</p>
          <ul>
            <li>✅ Upload photos from your local device</li>
            <li>✅ Take screenshots of webpages</li>
            <li>✅ Create text memories</li>
          </ul>
          <button class="btn-primary" onclick="document.getElementById('localPhotoUpload').click(); closeGoogleDriveModal();">
            Upload Local Photos Instead
          </button>
        </div>
      `;
    }
    
  } catch (error) {
    console.error('Failed to open Google Drive picker:', error);
    showMemoryToast('Failed to open Google Drive picker', 'error');
  }
}

// Handle local photo upload
async function handleLocalPhotoUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  
  try {
    let successCount = 0;
    
    for (let file of files) {
      if (!file.type.startsWith('image/')) continue;
      
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target.result;
        
        // Generate caption using AI if available
        let caption = `Photo: ${file.name}`;
        if (window.ai && window.ai.languageModel) {
          try {
            const session = await window.ai.languageModel.create();
            const aiCaption = await session.prompt(
              `Generate a brief, descriptive caption for a photo named "${file.name}". Keep it concise and natural.`
            );
            caption = aiCaption;
          } catch (error) {
            console.log('AI caption generation failed, using filename');
          }
        }
        
        // Create memory with photo
        const memory = createMemory(
          file.name.replace(/\.[^/.]+$/, ''), // Remove extension from title
          caption,
          'personal',
          ['photo', 'imported'],
          'image',
          imageData,
          {
            filename: file.name,
            filesize: file.size,
            uploadedAt: new Date().toISOString()
          }
        );
        
        successCount++;
        
        if (successCount === files.length) {
          showMemoryToast(`Successfully imported ${successCount} photo${successCount > 1 ? 's' : ''}!`, 'success');
          await renderMemories();
          closeGoogleDriveModal();
        }
      };
      
      reader.readAsDataURL(file);
    }
    
  } catch (error) {
    console.error('Failed to upload photos:', error);
    showMemoryToast('Failed to upload photos', 'error');
  }
}

// ============================================
// VISUAL FEEDBACK SYSTEM
// ============================================

// Show action feedback
function showActionFeedback(icon, text, progress = 0) {
  const feedback = document.getElementById('memoryActionFeedback');
  if (!feedback) return;
  
  const iconEl = feedback.querySelector('.feedback-icon');
  const textEl = feedback.querySelector('.feedback-text');
  const progressBar = feedback.querySelector('.progress-bar');
  
  iconEl.textContent = icon;
  textEl.textContent = text;
  progressBar.style.width = (typeof progress === 'number' ? progress : 0) + '%';
  
  feedback.style.display = 'block';
  setTimeout(() => feedback.classList.add('show'), 10);
}

// Update action feedback
function updateActionFeedback(icon, text, progress) {
  const feedback = document.getElementById('memoryActionFeedback');
  if (!feedback) return;
  
  const iconEl = feedback.querySelector('.feedback-icon');
  const textEl = feedback.querySelector('.feedback-text');
  const progressBar = feedback.querySelector('.progress-bar');
  
  if (icon) iconEl.textContent = icon;
  if (text) textEl.textContent = text;
  if (typeof progress === 'number') {
    progressBar.style.width = progress + '%';
  }
}

// Hide action feedback
function hideActionFeedback() {
  const feedback = document.getElementById('memoryActionFeedback');
  if (!feedback) return;
  
  feedback.classList.remove('show');
  setTimeout(() => {
    feedback.style.display = 'none';
    feedback.querySelector('.progress-bar').style.width = '0%';
  }, 300);
}

// ============================================
// CHAT WITH MEMORIES FEATURE
// ============================================

// Open memory chat panel
function openMemoryChat() {
  console.log('💬 Opening memory chat');
  const chatPanel = document.getElementById('memoryChatPanel');
  if (chatPanel) {
    chatPanel.style.display = 'flex';
    setTimeout(() => chatPanel.classList.add('show'), 10);
    
    // Setup close button listener
    const closeBtn = chatPanel.querySelector('.chat-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Chat close button clicked');
        closeMemoryChat();
      });
    }
    
    // Focus on input
    const input = document.getElementById('memoryChatInput');
    if (input) input.focus();
  }
}

// Close memory chat panel
function closeMemoryChat() {
  const chatPanel = document.getElementById('memoryChatPanel');
  if (chatPanel) {
    chatPanel.classList.remove('show');
    setTimeout(() => chatPanel.style.display = 'none', 300);
  }
}

// Ask a question to memory agent
async function askMemoryQuestion(question) {
  const input = document.getElementById('memoryChatInput');
  if (input) {
    input.value = question;
  }
  await sendMemoryChatMessage();
}

// Send chat message
async function sendMemoryChatMessage() {
  const input = document.getElementById('memoryChatInput');
  const messagesContainer = document.getElementById('memoryChatMessages');
  
  if (!input || !messagesContainer) return;
  
  const question = input.value.trim();
  if (!question) return;
  
  // Clear input
  input.value = '';
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user-message';
  userMsg.innerHTML = `
    <div class="message-content">${escapeHtml(question)}</div>
  `;
  messagesContainer.appendChild(userMsg);
  
  // Add loading message
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'chat-message agent-message loading';
  loadingMsg.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(loadingMsg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  try {
    // Get answer using AI
    const answer = await getMemoryAnswer(question);
    
    // Remove loading message
    loadingMsg.remove();
    
    // Add agent response
    const agentMsg = document.createElement('div');
    agentMsg.className = 'chat-message agent-message';
    agentMsg.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">${answer}</div>
    `;
    messagesContainer.appendChild(agentMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
  } catch (error) {
    loadingMsg.remove();
    const errorMsg = document.createElement('div');
    errorMsg.className = 'chat-message agent-message error';
    errorMsg.innerHTML = `
      <div class="message-avatar">⚠️</div>
      <div class="message-content">Sorry, I couldn't process your question. Please try again.</div>
    `;
    messagesContainer.appendChild(errorMsg);
  }
}

// Get answer from memories using AI
async function getMemoryAnswer(question) {
  try {
    // Build context from all memories
    const memoriesContext = Array.from(memories.values())
      .map(m => `Title: ${m.title}\nCategory: ${m.category}\nContent: ${m.content}\nTags: ${m.tags.join(', ')}`)
      .join('\n\n---\n\n');
    
    if (!window.ai || !window.ai.languageModel) {
      // Fallback: Simple keyword matching
      return simpleMemoryAnswer(question);
    }
    
    const session = await window.ai.languageModel.create({
      temperature: 0.7,
      topK: 5
    });
    
    const prompt = `You are a helpful Memory Agent assistant. Based on the user's stored memories below, answer their question naturally and helpfully. If relevant memories are found, reference them. If not found, say so politely.

User's Memories:
${memoriesContext}

User Question: ${question}

Answer (be concise and helpful):`;
    
    const response = await session.prompt(prompt);
    return response;
    
  } catch (error) {
    console.error('AI answer failed:', error);
    return simpleMemoryAnswer(question);
  }
}

// Simple fallback answer without AI
function simpleMemoryAnswer(question) {
  const questionLower = question.toLowerCase();
  const allMemories = Array.from(memories.values());
  
  // Find relevant memories by keyword matching
  const relevant = allMemories.filter(m => 
    m.title.toLowerCase().includes(questionLower) ||
    m.content.toLowerCase().includes(questionLower) ||
    m.tags.some(tag => questionLower.includes(tag.toLowerCase()))
  );
  
  if (relevant.length === 0) {
    return `I couldn't find any memories related to "${question}". Try searching with different keywords or browse your memories below.`;
  }
  
  let answer = `I found ${relevant.length} relevant ${relevant.length === 1 ? 'memory' : 'memories'}:\n\n`;
  
  relevant.slice(0, 3).forEach((m, i) => {
    answer += `${i + 1}. **${m.title}** (${m.category})\n${m.content.substring(0, 100)}...\n\n`;
  });
  
  if (relevant.length > 3) {
    answer += `...and ${relevant.length - 3} more. Use the search bar to see all results.`;
  }
  
  return answer;
}

// ============================================
// SUB-TAB NAVIGATION
// ============================================

// Switch memory sub-tab
function switchMemorySubtab(subtabName) {
  console.log('Switching to subtab:', subtabName);
  
  // Update sub-tab buttons
  const subtabBtns = document.querySelectorAll('.memory-subtab');
  subtabBtns.forEach(btn => {
    if (btn.dataset.subtab === subtabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  // Hide all subtab contents
  const captureSubtab = document.getElementById('captureSubtab');
  const searchSubtab = document.getElementById('searchSubtab');
  const chatSubtab = document.getElementById('chatSubtab');
  const gallerySubtab = document.getElementById('gallerySubtab');
  const laneSubtab = document.getElementById('laneSubtab');
  
  if (captureSubtab) captureSubtab.style.display = 'none';
  if (searchSubtab) searchSubtab.style.display = 'none';
  if (chatSubtab) chatSubtab.style.display = 'none';
  if (gallerySubtab) gallerySubtab.style.display = 'none';
  if (laneSubtab) laneSubtab.style.display = 'none';
  
  // Show selected subtab
  switch(subtabName) {
    case 'capture':
      if (captureSubtab) captureSubtab.style.display = 'flex';
      break;
    case 'search':
      if (searchSubtab) searchSubtab.style.display = 'flex';
      renderMemories();
      break;
    case 'chat':
      if (chatSubtab) chatSubtab.style.display = 'flex';
      break;
    case 'gallery':
      if (gallerySubtab) gallerySubtab.style.display = 'flex';
      renderGallery();
      break;
    case 'lane':
      if (laneSubtab) laneSubtab.style.display = 'flex';
      initializeMemoryLane();
      break;
  }
}

// ============================================
// INLINE CHAT (IN CHAT SUBTAB)
// ============================================

// Ask question in inline chat
async function askMemoryQuestionInline(question) {
  const input = document.getElementById('chatInterfaceInput');
  if (input) {
    input.value = question;
  }
  await sendChatInterfaceMessage();
}

// Send message in inline chat
async function sendChatInterfaceMessage() {
  const input = document.getElementById('chatInterfaceInput');
  const messagesContainer = document.getElementById('chatInterfaceMessages');
  
  if (!input || !messagesContainer) return;
  
  const question = input.value.trim();
  if (!question) return;
  
  // Clear input
  input.value = '';
  
  // Add user message
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user-message';
  userMsg.innerHTML = `
    <div class="message-content">${escapeHtml(question)}</div>
  `;
  messagesContainer.appendChild(userMsg);
  
  // Add loading message
  const loadingMsg = document.createElement('div');
  loadingMsg.className = 'chat-message agent-message loading';
  loadingMsg.innerHTML = `
    <div class="message-avatar">🤖</div>
    <div class="message-content">
      <div class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  messagesContainer.appendChild(loadingMsg);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
  
  try {
    // Get answer using AI
    const answer = await getMemoryAnswer(question);
    
    // Remove loading message
    loadingMsg.remove();
    
    // Add agent response
    const agentMsg = document.createElement('div');
    agentMsg.className = 'chat-message agent-message';
    agentMsg.innerHTML = `
      <div class="message-avatar">🤖</div>
      <div class="message-content">${answer}</div>
    `;
    messagesContainer.appendChild(agentMsg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
  } catch (error) {
    loadingMsg.remove();
    const errorMsg = document.createElement('div');
    errorMsg.className = 'chat-message agent-message error';
    errorMsg.innerHTML = `
      <div class="message-avatar">⚠️</div>
      <div class="message-content">Sorry, I couldn't process your question. Please try again.</div>
    `;
    messagesContainer.appendChild(errorMsg);
  }
}

// ============================================
// GALLERY VIEW
// ============================================

// Render gallery view
function renderGallery() {
  const galleryGrid = document.getElementById('galleryGrid');
  const galleryEmptyState = document.getElementById('galleryEmptyState');
  
  if (!galleryGrid) return;
  
  // Get visual memories (images, screenshots, videos)
  const visualMemories = Array.from(memories.values()).filter(m => 
    m.type === 'image' || m.type === 'screenshot' || m.type === 'video'
  );
  
  if (visualMemories.length === 0) {
    if (galleryEmptyState) {
      galleryEmptyState.style.display = 'flex';
    }
    // Clear gallery items
    const items = galleryGrid.querySelectorAll('.gallery-item');
    items.forEach(item => item.remove());
    return;
  }
  
  // Hide empty state
  if (galleryEmptyState) {
    galleryEmptyState.style.display = 'none';
  }
  
  // Clear existing items
  const items = galleryGrid.querySelectorAll('.gallery-item');
  items.forEach(item => item.remove());
  
  // Render gallery items
  visualMemories.forEach(memory => {
    const galleryItem = createGalleryItem(memory);
    galleryGrid.appendChild(galleryItem);
  });
}

// Create gallery item
function createGalleryItem(memory) {
  const item = document.createElement('div');
  item.className = 'gallery-item';
  item.onclick = () => {
    accessMemory(memory.id);
    expandMemory(memory.id);
  };
  
  const typeInfo = MEMORY_TYPES[memory.type] || MEMORY_TYPES.text;
  
  if (memory.type === 'video') {
    item.innerHTML = `
      <video src="${memory.mediaData}" muted></video>
      <div class="gallery-item-overlay">
        <div class="gallery-type-badge">${typeInfo.icon}</div>
        <div class="gallery-item-title">${escapeHtml(memory.title)}</div>
      </div>
    `;
  } else {
    item.innerHTML = `
      <img src="${memory.mediaData}" alt="${escapeHtml(memory.title)}" loading="lazy">
      <div class="gallery-item-overlay">
        <div class="gallery-type-badge">${typeInfo.icon}</div>
        <div class="gallery-item-title">${escapeHtml(memory.title)}</div>
      </div>
    `;
  }
  
  return item;
}

// Global functions for HTML onclick handlers
window.showAddMemoryModal = showAddMemoryModal;
window.closeAddMemoryModal = closeAddMemoryModal;
window.saveNewMemory = saveNewMemory;
window.editMemory = editMemory;
window.closeEditMemoryModal = closeEditMemoryModal;
window.saveEditedMemory = saveEditedMemory;
window.copyMemory = copyMemory;
window.confirmDeleteMemory = confirmDeleteMemory;
window.accessMemory = accessMemory;
window.expandMemory = expandMemory;
window.closeExpandMemoryModal = closeExpandMemoryModal;
window.clearMemorySearch = clearMemorySearch;
window.exportMemories = exportMemories;
window.captureScreenshotMemory = captureScreenshotMemory;
window.recordVoiceNote = recordVoiceNote;
window.showMemorySuggestions = showMemorySuggestions;
window.closeMemorySuggestions = closeMemorySuggestions;
window.findRelatedMemories = findRelatedMemories;
window.connectGoogleDrive = connectGoogleDrive;
window.closeGoogleDriveModal = closeGoogleDriveModal;
window.openGoogleDrivePicker = openGoogleDrivePicker;
window.handleLocalPhotoUpload = handleLocalPhotoUpload;
window.recordVideoMemory = recordVideoMemory;
window.connectGoogleDocs = connectGoogleDocs;
window.closeGoogleDocsModal = closeGoogleDocsModal;
window.openMemoryChat = openMemoryChat;
window.closeMemoryChat = closeMemoryChat;
window.askMemoryQuestion = askMemoryQuestion;
window.sendMemoryChatMessage = sendMemoryChatMessage;
window.switchMemorySubtab = switchMemorySubtab;
window.askMemoryQuestionInline = askMemoryQuestionInline;
window.sendChatInterfaceMessage = sendChatInterfaceMessage;
window.renderGallery = renderGallery;
window.scanBarcode = scanBarcode;
window.closeBarcodeScanner = closeBarcodeScanner;
window.saveScanResult = saveScanResult;
window.connectMobile = connectMobile;
window.closeMobileUpload = closeMobileUpload;

// ============================================
// MEMORY LANE - AI-POWERED NARRATIVE JOURNEYS
// ============================================

// Memory Lane state
let currentJourney = null;
let journeyTimer = null;
let journeyStartTime = null;

// Initialize Memory Insights (formerly Memory Lane)
function initializeMemoryLane() {
  console.log('📊 Initializing Memory Insights...');
  
  // Generate practical insights automatically
  setTimeout(() => {
    generateMemoryInsights();
    findConnections();
  }, 500); // Small delay to ensure memories are loaded
}

// Load proactive suggestions based on context
async function loadProactiveSuggestions() {
  const suggestionsContainer = document.getElementById('proactiveSuggestions');
  if (!suggestionsContainer) return;
  
  try {
    // Get current context (time, date, etc.)
    const now = new Date();
    const timeOfDay = getTimeOfDay(now);
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    // Generate context-aware suggestions
    const suggestions = await generateProactiveSuggestions(timeOfDay, dayOfWeek);
    
    // Render suggestions
    suggestionsContainer.innerHTML = '';
    suggestions.forEach(suggestion => {
      const card = createSuggestionCard(suggestion);
      suggestionsContainer.appendChild(card);
    });
    
  } catch (error) {
    console.error('Failed to load proactive suggestions:', error);
    suggestionsContainer.innerHTML = `
      <div class="journey-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <h4>No suggestions available</h4>
        <p>Add more memories to get personalized suggestions</p>
      </div>
    `;
  }
}

// Generate proactive suggestions using AI
async function generateProactiveSuggestions(timeOfDay, dayOfWeek) {
  const memoryArray = Array.from(memories.values());
  
  if (memoryArray.length === 0) {
    return [{
      title: "Start Your Memory Journey",
      preview: "Add your first memory to begin receiving personalized suggestions",
      type: "onboarding",
      count: 0,
      action: () => switchMemorySubtab('capture')
    }];
  }
  
  const suggestions = [];
  
  // Time-based suggestions
  if (timeOfDay === 'morning') {
    const morningMemories = memoryArray.filter(m => 
      m.content.toLowerCase().includes('morning') || 
      m.content.toLowerCase().includes('breakfast') ||
      m.content.toLowerCase().includes('coffee')
    );
    
    if (morningMemories.length > 0) {
      suggestions.push({
        title: "Morning Memories",
        preview: "Relive your favorite morning moments and routines",
        type: "time-based",
        count: morningMemories.length,
        memories: morningMemories,
        action: () => startJourneyWithMemories(morningMemories, "Morning Memories")
      });
    }
  }
  
  // Recent memories
  const recentMemories = memoryArray
    .filter(m => Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000) // Last 7 days
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);
    
  if (recentMemories.length > 0) {
    suggestions.push({
      title: "This Week's Highlights",
      preview: "A journey through your recent memories and experiences",
      type: "recent",
      count: recentMemories.length,
      memories: recentMemories,
      action: () => startJourneyWithMemories(recentMemories, "This Week's Highlights")
    });
  }
  
  // Photo memories
  const photoMemories = memoryArray.filter(m => m.type === 'image' || m.type === 'screenshot');
  if (photoMemories.length > 0) {
    suggestions.push({
      title: "Visual Journey",
      preview: "A cinematic experience through your photo memories",
      type: "visual",
      count: photoMemories.length,
      memories: photoMemories,
      action: () => startJourneyWithMemories(photoMemories, "Visual Journey")
    });
  }
  
  // Apply Choice Overload principle: limit to max 3 suggestions
  return suggestions.slice(0, 3);
}

// Create suggestion card
function createSuggestionCard(suggestion) {
  const card = document.createElement('div');
  card.className = 'suggestion-card';
  card.onclick = suggestion.action;
  
  card.innerHTML = `
    <div class="suggestion-title">${suggestion.title}</div>
    <div class="suggestion-preview">${suggestion.preview}</div>
    <div class="suggestion-meta">
      <span>${getTimeOfDay(new Date())}</span>
      <span class="suggestion-count">${suggestion.count} memories</span>
    </div>
  `;
  
  return card;
}

// Start proactive journey
async function startProactiveJourney() {
  console.log('🚀 Starting proactive journey...');
  
  // Show status
  showJourneyStatus('Analyzing your memories...', 'Finding the perfect narrative for you');
  
  try {
    // Get all memories
    const memoryArray = Array.from(memories.values());
    
    if (memoryArray.length === 0) {
      hideJourneyStatus();
      alert('Add some memories first to start your journey!');
      switchMemorySubtab('capture');
      return;
    }
    
    // Use AI to select and order memories for narrative
    const selectedMemories = await selectMemoriesForJourney(memoryArray);
    
    // Start the journey
    await startJourneyWithMemories(selectedMemories, 'Your Memory Journey');
    
  } catch (error) {
    console.error('Failed to start proactive journey:', error);
    hideJourneyStatus();
    alert('Failed to start journey. Please try again.');
  }
}

// Create custom journey
async function createCustomJourney() {
  console.log('🎨 Creating custom journey...');
  
  const memoryArray = Array.from(memories.values());
  
  if (memoryArray.length === 0) {
    alert('Add some memories first to create a custom journey!');
    switchMemorySubtab('capture');
    return;
  }
  
  // Simple selection for now - could be enhanced with a modal
  const theme = prompt('What theme would you like for your journey?\n\nExamples:\n- "work achievements"\n- "family moments"\n- "travel adventures"\n- "recent photos"');
  
  if (!theme) return;
  
  showJourneyStatus('Creating your custom journey...', `Finding memories related to "${theme}"`);
  
  try {
    // Filter memories by theme using simple keyword matching
    const filteredMemories = memoryArray.filter(memory => 
      memory.content.toLowerCase().includes(theme.toLowerCase()) ||
      memory.category === theme.toLowerCase() ||
      (memory.tags && memory.tags.some(tag => tag.toLowerCase().includes(theme.toLowerCase())))
    );
    
    if (filteredMemories.length === 0) {
      // Fallback to all memories if no matches
      await startJourneyWithMemories(memoryArray.slice(0, 5), `Custom Journey: ${theme}`);
    } else {
      await startJourneyWithMemories(filteredMemories, `Custom Journey: ${theme}`);
    }
    
  } catch (error) {
    console.error('Failed to create custom journey:', error);
    hideJourneyStatus();
    alert('Failed to create custom journey. Please try again.');
  }
}

// Select memories for journey using AI
async function selectMemoriesForJourney(allMemories) {
  // For now, use a simple algorithm - could be enhanced with AI
  const selected = [];
  
  // Prioritize recent memories with media
  const recentWithMedia = allMemories
    .filter(m => m.type !== 'text' && Date.now() - m.timestamp < 30 * 24 * 60 * 60 * 1000)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);
  
  selected.push(...recentWithMedia);
  
  // Add some text memories for narrative
  const textMemories = allMemories
    .filter(m => m.type === 'text' && !selected.includes(m))
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 2);
  
  selected.push(...textMemories);
  
  // Ensure we have at least 3 memories
  if (selected.length < 3) {
    const additional = allMemories
      .filter(m => !selected.includes(m))
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3 - selected.length);
    
    selected.push(...additional);
  }
  
  return selected.slice(0, 5); // Max 5 memories per journey (Miller's Law: 7±2)
}

// Start journey with specific memories
async function startJourneyWithMemories(memoriesToUse, journeyTitle) {
  console.log('🎬 Starting cinematic journey:', journeyTitle);
  
  if (memoriesToUse.length === 0) {
    alert('No memories available for this journey!');
    return;
  }
  
  // Initialize journey state
  currentJourney = {
    title: journeyTitle,
    memories: memoriesToUse,
    currentIndex: 0,
    startTime: Date.now()
  };
  
  // Hide status and show journey viewer
  hideJourneyStatus();
  showJourneyViewer();
  
  // Start the narrative
  await displayCurrentMemory();
  
  // Start timer
  startJourneyTimer();
  
  // Save to history
  saveJourneyToHistory(journeyTitle, memoriesToUse.length);
}

// Display current memory in journey
async function displayCurrentMemory() {
  if (!currentJourney || currentJourney.currentIndex >= currentJourney.memories.length) {
    endJourney();
    return;
  }
  
  const memory = currentJourney.memories[currentJourney.currentIndex];
  const showcase = document.getElementById('memoryShowcase');
  const narrative = document.getElementById('narrativeText');
  
  if (!showcase || !narrative) return;
  
  // Display memory content
  showcase.innerHTML = '';
  
  if (memory.type === 'image' || memory.type === 'screenshot') {
    const img = document.createElement('img');
    img.src = memory.mediaData;
    img.alt = memory.content;
    showcase.appendChild(img);
  } else if (memory.type === 'video') {
    const video = document.createElement('video');
    video.src = memory.mediaData;
    video.controls = true;
    video.autoplay = true;
    video.muted = true;
    showcase.appendChild(video);
  } else {
    // Text memory - show as styled text
    const textDiv = document.createElement('div');
    textDiv.style.cssText = `
      padding: 40px;
      background: white;
      border-radius: 12px;
      border: 2px solid #e9ecef;
      font-size: 1.2em;
      line-height: 1.6;
      color: #495057;
      text-align: center;
      max-width: 400px;
      margin: 0 auto;
    `;
    textDiv.textContent = memory.content;
    showcase.appendChild(textDiv);
  }
  
  // Generate AI narrative
  const narrativeText = await generateMemoryNarrative(memory, currentJourney.currentIndex, currentJourney.memories.length);
  narrative.textContent = narrativeText;
  
  // Update progress
  updateJourneyProgress();
  
  // Update navigation buttons
  updateNavigationButtons();
}

// Generate AI narrative for memory
async function generateMemoryNarrative(memory, index, total) {
  try {
    // Use Chrome AI if available
    if (window.ai && window.ai.languageModel) {
      const session = await window.ai.languageModel.create({
        temperature: 0.8,
        topK: 40
      });
      
      const prompt = `You are a gentle, empathetic storyteller helping someone revisit their memories. 

Memory ${index + 1} of ${total}:
Content: "${memory.content}"
Type: ${memory.type}
Date: ${new Date(memory.timestamp).toLocaleDateString()}

Create a warm, personal narrative (2-3 sentences) that:
- Speaks directly to the person ("you", "your")
- Highlights the emotional significance
- Connects to the broader story of their life
- Uses gentle, encouraging language

Example tone: "This beautiful moment from your day shows how you find joy in simple things. The way you captured this memory tells a story of someone who appreciates life's precious details."`;

      const response = await session.prompt(prompt);
      session.destroy();
      
      return response || getDefaultNarrative(memory, index, total);
    }
  } catch (error) {
    console.error('AI narrative generation failed:', error);
  }
  
  // Fallback to simple narrative
  return getDefaultNarrative(memory, index, total);
}

// Get default narrative when AI is not available
function getDefaultNarrative(memory, index, total) {
  const templates = [
    `Here's a special memory from ${new Date(memory.timestamp).toLocaleDateString()}. ${memory.content}`,
    `This moment captures something meaningful about your journey. ${memory.content}`,
    `Looking back at this memory, you can see how it fits into your larger story. ${memory.content}`,
    `This memory holds a special place in your collection of experiences. ${memory.content}`,
    `Each memory tells a part of your unique story, and this one is particularly special. ${memory.content}`
  ];
  
  return templates[index % templates.length];
}

// Journey control functions
function pauseJourney() {
  if (journeyTimer) {
    clearInterval(journeyTimer);
    journeyTimer = null;
    
    const btn = document.getElementById('pauseJourneyBtn');
    if (btn) {
      btn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="5 3 19 12 5 21 5 3"/>
        </svg>
      `;
      btn.onclick = resumeJourney;
    }
  }
}

function resumeJourney() {
  startJourneyTimer();
  
  const btn = document.getElementById('pauseJourneyBtn');
  if (btn) {
    btn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="6" y="4" width="4" height="16"/>
        <rect x="14" y="4" width="4" height="16"/>
      </svg>
    `;
    btn.onclick = pauseJourney;
  }
}

function closeJourney() {
  endJourney();
}

function previousMemoryInJourney() {
  if (currentJourney && currentJourney.currentIndex > 0) {
    currentJourney.currentIndex--;
    displayCurrentMemory();
  }
}

function nextMemoryInJourney() {
  if (currentJourney && currentJourney.currentIndex < currentJourney.memories.length - 1) {
    currentJourney.currentIndex++;
    displayCurrentMemory();
  } else {
    endJourney();
  }
}

// Journey UI functions
function showJourneyStatus(title, description) {
  const status = document.getElementById('journeyStatus');
  const titleEl = document.getElementById('journeyStatusTitle');
  const descEl = document.getElementById('journeyStatusDesc');
  
  if (status && titleEl && descEl) {
    titleEl.textContent = title;
    descEl.textContent = description;
    status.style.display = 'block';
  }
}

function hideJourneyStatus() {
  const status = document.getElementById('journeyStatus');
  if (status) {
    status.style.display = 'none';
  }
}

function showJourneyViewer() {
  const viewer = document.getElementById('journeyViewer');
  const title = document.getElementById('journeyTitle');
  
  if (viewer && title && currentJourney) {
    title.textContent = currentJourney.title;
    viewer.style.display = 'block';
  }
}

function hideJourneyViewer() {
  const viewer = document.getElementById('journeyViewer');
  if (viewer) {
    viewer.style.display = 'none';
  }
}

function updateJourneyProgress() {
  if (!currentJourney) return;
  
  const progressFill = document.getElementById('journeyProgressFill');
  const progressText = document.getElementById('journeyProgressText');
  
  if (progressFill && progressText) {
    const progress = ((currentJourney.currentIndex + 1) / currentJourney.memories.length) * 100;
    
    // Goal-Gradient Effect: Accelerate animation as user gets closer to end
    const animationSpeed = progress > 60 ? '0.5s' : '0.3s';
    progressFill.style.transition = `width ${animationSpeed} ease-out`;
    progressFill.style.width = `${progress}%`;
    
    // Add completion motivation
    if (progress >= 80) {
      progressText.textContent = `Almost done! Memory ${currentJourney.currentIndex + 1} of ${currentJourney.memories.length}`;
      progressFill.style.background = 'linear-gradient(90deg, #28a745, #20c997)'; // Green for near completion
    } else {
      progressText.textContent = `Memory ${currentJourney.currentIndex + 1} of ${currentJourney.memories.length}`;
      progressFill.style.background = 'linear-gradient(90deg, #667eea, #764ba2)'; // Default gradient
    }
  }
}

function updateNavigationButtons() {
  if (!currentJourney) return;
  
  const prevBtn = document.getElementById('prevMemoryBtn');
  const nextBtn = document.getElementById('nextMemoryBtn');
  
  if (prevBtn) {
    prevBtn.disabled = currentJourney.currentIndex === 0;
  }
  
  if (nextBtn) {
    if (currentJourney.currentIndex === currentJourney.memories.length - 1) {
      nextBtn.textContent = 'Finish';
      nextBtn.innerHTML = `
        Finish
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      `;
    } else {
      nextBtn.innerHTML = `
        Next
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      `;
    }
  }
}

function startJourneyTimer() {
  if (journeyTimer) clearInterval(journeyTimer);
  
  journeyTimer = setInterval(() => {
    if (currentJourney) {
      const elapsed = Date.now() - currentJourney.startTime;
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      
      const durationEl = document.getElementById('journeyDuration');
      if (durationEl) {
        durationEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
  }, 1000);
}

function endJourney() {
  console.log('🏁 Journey ended');
  
  // Clear timer
  if (journeyTimer) {
    clearInterval(journeyTimer);
    journeyTimer = null;
  }
  
  // Hide viewer
  hideJourneyViewer();
  
  // Clear current journey
  currentJourney = null;
  
  // Show completion message
  showActionFeedback('Journey completed! ✨', 'Thank you for taking this memory journey');
  setTimeout(hideActionFeedback, 3000);
  
  // Refresh history
  loadJourneyHistory();
}

// Journey history functions
function saveJourneyToHistory(title, memoryCount) {
  try {
    const history = JSON.parse(localStorage.getItem('journeyHistory') || '[]');
    
    const journey = {
      id: Date.now(),
      title,
      memoryCount,
      timestamp: Date.now(),
      duration: 0 // Will be updated when journey ends
    };
    
    history.unshift(journey);
    
    // Keep only last 10 journeys
    if (history.length > 10) {
      history.splice(10);
    }
    
    localStorage.setItem('journeyHistory', JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save journey to history:', error);
  }
}

function loadJourneyHistory() {
  const historyContainer = document.getElementById('journeyHistory');
  if (!historyContainer) return;
  
  try {
    const history = JSON.parse(localStorage.getItem('journeyHistory') || '[]');
    
    if (history.length === 0) {
      historyContainer.innerHTML = `
        <div class="journey-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <h4>No journeys yet</h4>
          <p>Start your first memory journey to see it here</p>
        </div>
      `;
      return;
    }
    
    historyContainer.innerHTML = '';
    
    history.forEach(journey => {
      const item = createHistoryItem(journey);
      historyContainer.appendChild(item);
    });
    
  } catch (error) {
    console.error('Failed to load journey history:', error);
  }
}

function createHistoryItem(journey) {
  const item = document.createElement('div');
  item.className = 'history-item';
  
  const timeAgo = getTimeAgo(journey.timestamp);
  
  item.innerHTML = `
    <div class="history-icon">🛤️</div>
    <div class="history-content">
      <div class="history-title">${journey.title}</div>
      <div class="history-meta">${journey.memoryCount} memories • ${timeAgo}</div>
    </div>
    <div class="history-duration">${formatDuration(journey.duration)}</div>
  `;
  
  // Could add click handler to replay journey
  item.onclick = () => {
    console.log('Replay journey:', journey.title);
    // TODO: Implement journey replay
  };
  
  return item;
}

// Utility functions
function getTimeOfDay(date) {
  const hour = date.getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

function formatDuration(ms) {
  if (!ms) return '0:00';
  
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Progressive Disclosure: Toggle advanced options
function toggleAdvancedOptions() {
  const advancedOptions = document.getElementById('advancedOptions');
  const toggleBtn = document.getElementById('advancedToggle');
  
  if (advancedOptions && toggleBtn) {
    const isVisible = advancedOptions.style.display !== 'none';
    
    if (isVisible) {
      advancedOptions.style.display = 'none';
      toggleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="1"/>
          <circle cx="12" cy="5" r="1"/>
          <circle cx="12" cy="19" r="1"/>
        </svg>
        More Options
      `;
    } else {
      advancedOptions.style.display = 'flex';
      toggleBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
        Less Options
      `;
    }
  }
}

// Journey Settings (placeholder for future enhancement)
function showJourneySettings() {
  alert('Journey Settings:\n\n• Narrative Speed: Adjustable\n• AI Personality: Empathetic (default)\n• Auto-advance: 5 seconds\n• Background Music: Disabled\n\nComing soon in future updates!');
}

// Demo helper functions
function clearAllMemories() {
  if (confirm('🗑️ Clear all memories?\n\nThis will delete all current memories and cannot be undone.')) {
    memories.clear();
    saveMemories();
    renderMemories();
    updateMemoryCount();
    console.log('All memories cleared');
    
    // Show feedback
    showActionFeedback('All memories cleared! 🗑️', 'Ready for fresh demo content');
    setTimeout(hideActionFeedback, 2000);
  }
}

function loadDemoMemories() {
  const sampleCount = window.SAMPLE_MEMORIES ? window.SAMPLE_MEMORIES.length : 15;
  if (confirm(`📝 Load demo memories?\n\nThis will add ${sampleCount} rich sample memories with images for demonstration purposes.`)) {
    createSampleMemories();
    console.log('Demo memories loaded');
    
    // Show feedback
    showActionFeedback('Demo memories loaded! 🎉', `${sampleCount} rich memories with images added`);
    setTimeout(() => {
      hideActionFeedback();
      renderMemories();
      updateMemoryCount();
      
      // Auto-refresh insights if on insights tab
      const currentTab = document.querySelector('.memory-subtab.active')?.dataset?.subtab;
      if (currentTab === 'lane') {
        generateMemoryInsights();
        findConnections();
      }
    }, 2000);
  }
}

// ============================================
// MEMORY INSIGHTS - PRACTICAL ANALYSIS
// ============================================

// Generate actionable insights from memories
function generateInsights() {
  console.log('📊 Generating memory insights...');
  
  const insightsContainer = document.getElementById('memoryInsights');
  if (!insightsContainer) return;
  
  const memoryArray = Array.from(memories.values());
  
  if (memoryArray.length === 0) {
    insightsContainer.innerHTML = `
      <div class="insight-empty">
        <p>Add some memories to see patterns and insights!</p>
      </div>
    `;
    return;
  }
  
  const insights = analyzeMemoryPatterns(memoryArray);
  
  insightsContainer.innerHTML = '';
  insights.forEach(insight => {
    const card = createInsightCard(insight);
    insightsContainer.appendChild(card);
  });
}

// Analyze memory patterns for practical insights
function analyzeMemoryPatterns(memoryArray) {
  const insights = [];
  
  // 1. Productivity Patterns
  const workMemories = memoryArray.filter(m => m.category === 'work');
  const workSuccesses = workMemories.filter(m => 
    m.content.toLowerCase().includes('success') || 
    m.content.toLowerCase().includes('completed') ||
    m.content.toLowerCase().includes('achieved')
  );
  
  if (workSuccesses.length > 0) {
    insights.push({
      type: 'productivity',
      title: 'Work Success Pattern',
      description: `You've recorded ${workSuccesses.length} work achievements. Common themes: ${extractCommonWords(workSuccesses.map(m => m.content)).slice(0, 3).join(', ')}`,
      actionable: 'Consider documenting what made these successful for future reference',
      icon: '🎯',
      color: '#28a745'
    });
  }
  
  // 2. Learning Insights
  const learningMemories = memoryArray.filter(m => 
    m.category === 'notes' || 
    m.content.toLowerCase().includes('learn') ||
    m.content.toLowerCase().includes('insight')
  );
  
  if (learningMemories.length > 0) {
    insights.push({
      type: 'learning',
      title: 'Knowledge Growth',
      description: `${learningMemories.length} learning entries found. You're actively building knowledge in: ${extractCategories(learningMemories).join(', ')}`,
      actionable: 'Create connections between related learnings for better retention',
      icon: '🧠',
      color: '#17a2b8'
    });
  }
  
  // 3. Time Patterns
  const recentMemories = memoryArray.filter(m => 
    Date.now() - m.timestamp < 7 * 24 * 60 * 60 * 1000
  );
  
  if (recentMemories.length > 0) {
    const avgPerDay = recentMemories.length / 7;
    insights.push({
      type: 'activity',
      title: 'Memory Activity',
      description: `You're averaging ${avgPerDay.toFixed(1)} memories per day this week`,
      actionable: avgPerDay < 1 ? 'Consider capturing more daily moments' : 'Great memory capture habit!',
      icon: '📈',
      color: '#ffc107'
    });
  }
  
  // 4. Content Gaps
  const categories = ['personal', 'work', 'ideas', 'notes'];
  const missingCategories = categories.filter(cat => 
    !memoryArray.some(m => m.category === cat)
  );
  
  if (missingCategories.length > 0) {
    insights.push({
      type: 'gaps',
      title: 'Memory Gaps',
      description: `Missing memories in: ${missingCategories.join(', ')}`,
      actionable: 'Consider adding memories from these areas for a complete picture',
      icon: '🎯',
      color: '#dc3545'
    });
  }
  
  return insights;
}

// Find connections between memories
function findConnections() {
  console.log('🔗 Finding memory connections...');
  
  const connectionsContainer = document.getElementById('memoryConnections');
  if (!connectionsContainer) {
    console.log('❌ memoryConnections container not found');
    return;
  }
  
  const memoryArray = Array.from(memories.values());
  console.log(`📊 Found ${memoryArray.length} memories for connection analysis`);
  
  if (memoryArray.length < 2) {
    connectionsContainer.innerHTML = `
      <div class="connection-empty">
        <p>Add more memories to discover connections!</p>
      </div>
    `;
    return;
  }
  
  const connections = findMemoryConnections(memoryArray);
  console.log(`🔗 Found ${connections.length} connections`);
  
  connectionsContainer.innerHTML = '';
  connections.forEach(connection => {
    const card = createConnectionCard(connection);
    connectionsContainer.appendChild(card);
  });
  
  // Also populate Recent Journeys with sample data
  populateRecentJourneys();
}

// Find actual connections between memories
function findMemoryConnections(memoryArray) {
  const connections = [];
  
  // 1. Tag-based connections
  const tagGroups = {};
  memoryArray.forEach(memory => {
    if (memory.tags) {
      memory.tags.forEach(tag => {
        if (!tagGroups[tag]) tagGroups[tag] = [];
        tagGroups[tag].push(memory);
      });
    }
  });
  
  Object.entries(tagGroups).forEach(([tag, memories]) => {
    if (memories.length > 1) {
      connections.push({
        type: 'tag',
        title: `"${tag}" Connection`,
        memories: memories.slice(0, 3), // Show max 3
        description: `${memories.length} memories share this theme`,
        strength: memories.length
      });
    }
  });
  
  // 2. Time-based connections (same day/week)
  const timeGroups = {};
  memoryArray.forEach(memory => {
    const date = new Date(memory.timestamp).toDateString();
    if (!timeGroups[date]) timeGroups[date] = [];
    timeGroups[date].push(memory);
  });
  
  Object.entries(timeGroups).forEach(([date, memories]) => {
    if (memories.length > 1) {
      connections.push({
        type: 'time',
        title: `Same Day (${new Date(date).toLocaleDateString()})`,
        memories: memories.slice(0, 3),
        description: `${memories.length} memories from the same day`,
        strength: memories.length
      });
    }
  });
  
  // 3. Content similarity (simple keyword matching)
  const contentConnections = findContentSimilarities(memoryArray);
  connections.push(...contentConnections);
  
  // Sort by strength and return top connections
  return connections
    .sort((a, b) => b.strength - a.strength)
    .slice(0, 6); // Max 6 connections
}

// Helper functions
function extractCommonWords(texts) {
  const words = texts.join(' ').toLowerCase()
    .split(/\W+/)
    .filter(word => word.length > 3)
    .filter(word => !['this', 'that', 'with', 'have', 'been', 'were', 'they'].includes(word));
  
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

function extractCategories(memories) {
  const categories = [...new Set(memories.map(m => m.category))];
  return categories;
}

function findContentSimilarities(memoryArray) {
  const connections = [];
  
  // Simple keyword-based similarity
  for (let i = 0; i < memoryArray.length - 1; i++) {
    for (let j = i + 1; j < memoryArray.length; j++) {
      const similarity = calculateTextSimilarity(
        memoryArray[i].content, 
        memoryArray[j].content
      );
      
      if (similarity > 0.3) { // 30% similarity threshold
        connections.push({
          type: 'content',
          title: 'Similar Content',
          memories: [memoryArray[i], memoryArray[j]],
          description: `${Math.round(similarity * 100)}% content similarity`,
          strength: similarity
        });
      }
    }
  }
  
  return connections;
}

function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\W+/));
  const words2 = new Set(text2.toLowerCase().split(/\W+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// UI Creation functions
function createInsightCard(insight) {
  const card = document.createElement('div');
  card.className = 'insight-card';
  card.style.borderLeft = `4px solid ${insight.color}`;
  
  card.innerHTML = `
    <div class="insight-header">
      <span class="insight-icon">${insight.icon}</span>
      <h4>${insight.title}</h4>
    </div>
    <p class="insight-description">${insight.description}</p>
    <div class="insight-action">
      <strong>💡 Action:</strong> ${insight.actionable}
    </div>
  `;
  
  return card;
}

function createConnectionCard(connection) {
  const card = document.createElement('div');
  card.className = 'connection-card';
  
  const memoryTitles = connection.memories
    .map(m => m.title || m.content.substring(0, 30) + '...')
    .join(' • ');
  
  card.innerHTML = `
    <div class="connection-header">
      <span class="connection-type">${getConnectionIcon(connection.type)}</span>
      <h4>${connection.title}</h4>
    </div>
    <p class="connection-description">${connection.description}</p>
    <div class="connection-memories">
      <small>${memoryTitles}</small>
    </div>
  `;
  
  card.onclick = () => showConnectionDetails(connection);
  
  return card;
}

function getConnectionIcon(type) {
  switch (type) {
    case 'tag': return '🏷️';
    case 'time': return '📅';
    case 'content': return '📝';
    default: return '🔗';
  }
}

function showConnectionDetails(connection) {
  console.log('Showing connection details:', connection);
  
  // Create and show connection details modal
  const modal = document.createElement('div');
  modal.className = 'memory-modal-overlay';
  modal.style.display = 'flex';
  
  const modalContent = `
    <div class="memory-modal-content connection-details-modal">
      <div class="memory-modal-header">
        <h3>${getConnectionIcon(connection.type)} ${connection.title}</h3>
        <button class="close-btn" onclick="closeConnectionModal()">&times;</button>
      </div>
      
      <div class="connection-details-body">
        <p class="connection-description">${connection.description}</p>
        
        <div class="connected-memories">
          <h4>Connected Memories (${connection.memories.length})</h4>
          <div class="memory-list">
            ${connection.memories.map(memory => `
              <div class="connected-memory-item" onclick="viewMemoryDetails('${memory.id}')">
                <div class="memory-item-header">
                  <h5>${memory.title || memory.content.substring(0, 50) + '...'}</h5>
                  <span class="memory-category">${memory.category}</span>
                </div>
                <p class="memory-preview">${memory.content.substring(0, 100)}${memory.content.length > 100 ? '...' : ''}</p>
                <div class="memory-tags">
                  ${(memory.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                ${memory.mediaData ? '<div class="has-media">📷 Has Image</div>' : ''}
              </div>
            `).join('')}
          </div>
        </div>
        
        <div class="connection-actions">
          <button class="action-btn primary" onclick="searchByConnection('${connection.type}', '${connection.title}')">
            Search Similar
          </button>
          <button class="action-btn secondary" onclick="createJourneyFromConnection('${connection.title}')">
            Create Journey
          </button>
        </div>
      </div>
    </div>
  `;
  
  modal.innerHTML = modalContent;
  document.body.appendChild(modal);
  
  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeConnectionModal();
    }
  });
}

// Close connection modal
function closeConnectionModal() {
  const modal = document.querySelector('.memory-modal-overlay');
  if (modal) {
    modal.remove();
  }
}

// Search by connection type
function searchByConnection(type, title) {
  console.log(`Searching by ${type}: ${title}`);
  
  // Switch to search tab and perform search
  if (typeof window.switchMemorySubtab === 'function') {
    window.switchMemorySubtab('search');
    
    // Set search input
    setTimeout(() => {
      const searchInput = document.querySelector('#memorySearchInput');
      if (searchInput) {
        // Extract search term from connection title
        const searchTerm = title.replace(/['"]/g, '').replace(' Connection', '');
        searchInput.value = searchTerm;
        
        // Trigger search
        if (typeof window.handleMemorySearch === 'function') {
          window.handleMemorySearch();
        }
      }
    }, 100);
  }
  
  closeConnectionModal();
}

// Create journey from connection
function createJourneyFromConnection(connectionTitle) {
  console.log(`Creating journey from connection: ${connectionTitle}`);
  
  // Show feedback
  showActionFeedback('Journey Created! 🎬', `Created journey based on "${connectionTitle}" connection`);
  setTimeout(hideActionFeedback, 3000);
  
  closeConnectionModal();
}

// View individual memory details
function viewMemoryDetails(memoryId) {
  console.log(`Viewing memory details: ${memoryId}`);
  
  const memory = memories.get(memoryId);
  if (memory && typeof window.expandMemory === 'function') {
    window.expandMemory(memoryId);
  }
  
  closeConnectionModal();
}

// Generate insights automatically
function generateMemoryInsights() {
  generateInsights();
}

// Populate Recent Journeys with sample data
function populateRecentJourneys() {
  const journeyHistoryContainer = document.getElementById('journeyHistory');
  if (!journeyHistoryContainer) {
    console.log('❌ journeyHistory container not found');
    return;
  }
  
  const memoryArray = Array.from(memories.values());
  if (memoryArray.length === 0) {
    journeyHistoryContainer.innerHTML = `
      <div class="journey-empty">
        <p>No journeys yet</p>
        <small>Start your first memory journey to see it here</small>
      </div>
    `;
    return;
  }
  
  // Create sample journey entries based on available memories
  const sampleJourneys = [
    {
      title: 'Family Memories Journey',
      description: 'A heartwarming collection of family moments and celebrations',
      memoryCount: memoryArray.filter(m => m.tags && m.tags.includes('family')).length || 3,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      duration: '4 min'
    },
    {
      title: 'Work Success Story',
      description: 'Career achievements and professional milestones',
      memoryCount: memoryArray.filter(m => m.category === 'work').length || 4,
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      duration: '6 min'
    },
    {
      title: 'Learning & Growth',
      description: 'Educational experiences and skill development',
      memoryCount: memoryArray.filter(m => m.category === 'notes' || (m.tags && m.tags.includes('learning'))).length || 3,
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      duration: '5 min'
    }
  ];
  
  journeyHistoryContainer.innerHTML = '';
  sampleJourneys.forEach(journey => {
    if (journey.memoryCount > 0) {
      const journeyItem = createJourneyHistoryItem(journey);
      journeyHistoryContainer.appendChild(journeyItem);
    }
  });
}

// Create journey history item
function createJourneyHistoryItem(journey) {
  const item = document.createElement('div');
  item.className = 'history-item';
  
  item.innerHTML = `
    <div class="history-item-header">
      <h5>${journey.title}</h5>
      <span class="history-date">${getTimeAgo(journey.date)}</span>
    </div>
    <p class="history-description">${journey.description}</p>
    <div class="history-meta">
      <span class="history-count">${journey.memoryCount} memories</span>
      <span class="history-duration">${journey.duration}</span>
    </div>
  `;
  
  item.onclick = () => {
    console.log('Replaying journey:', journey.title);
    // Could implement journey replay functionality here
  };
  
  return item;
}

// Memory Lane exports (keeping for compatibility)
window.initializeMemoryLane = initializeMemoryLane;
window.generateInsights = generateInsights;
window.findConnections = findConnections;
window.generateMemoryInsights = generateMemoryInsights;
window.findMemoryConnections = findMemoryConnections;
window.populateRecentJourneys = populateRecentJourneys;
window.showConnectionDetails = showConnectionDetails;
window.closeConnectionModal = closeConnectionModal;
window.searchByConnection = searchByConnection;
window.createJourneyFromConnection = createJourneyFromConnection;
window.viewMemoryDetails = viewMemoryDetails;

// Demo helper exports
window.clearAllMemories = clearAllMemories;
window.loadDemoMemories = loadDemoMemories;

// Debug helper for Memory Lane tab
window.debugMemoryLane = function() {
  console.log('🔧 Debug Memory Lane:');
  console.log('- Memory Lane tab exists:', !!document.querySelector('[data-subtab="lane"]'));
  console.log('- Memory Lane subtab exists:', !!document.getElementById('laneSubtab'));
  console.log('- Current memories count:', memories.size);
  console.log('- switchMemorySubtab function:', typeof window.switchMemorySubtab);
  
  // Try to switch to Memory Lane
  if (typeof window.switchMemorySubtab === 'function') {
    window.switchMemorySubtab('lane');
    console.log('✅ Switched to Memory Lane tab');
  } else {
    console.log('❌ switchMemorySubtab function not available');
  }
};

// Debug helper for insights buttons
window.debugInsights = function() {
  console.log('🔧 Debug Insights:');
  console.log('- Memories count:', memories.size);
  console.log('- memoryInsights container:', !!document.getElementById('memoryInsights'));
  console.log('- memoryConnections container:', !!document.getElementById('memoryConnections'));
  console.log('- journeyHistory container:', !!document.getElementById('journeyHistory'));
  console.log('- generateInsights function:', typeof window.generateInsights);
  console.log('- findConnections function:', typeof window.findConnections);
  console.log('- Analyze button exists:', !!document.querySelector('button[onclick="generateInsights()"]'));
  console.log('- Connections button exists:', !!document.querySelector('button[onclick="findConnections()"]'));
  
  // Test functions manually
  console.log('🧪 Testing generateInsights...');
  try {
    generateInsights();
    console.log('✅ generateInsights executed');
  } catch (error) {
    console.log('❌ generateInsights error:', error);
  }
  
  console.log('🧪 Testing findConnections...');
  try {
    findConnections();
    console.log('✅ findConnections executed');
  } catch (error) {
    console.log('❌ findConnections error:', error);
  }
};

// Verify all functions are available
console.log('✅ Memory Agent functions loaded:');
console.log('  - captureScreenshotMemory:', typeof window.captureScreenshotMemory);
console.log('  - recordVideoMemory:', typeof window.recordVideoMemory);
console.log('  - connectGoogleDocs:', typeof window.connectGoogleDocs);
console.log('  - connectGoogleDrive:', typeof window.connectGoogleDrive);
console.log('  - startProactiveJourney:', typeof window.startProactiveJourney);
console.log('🧠 Memory Agent script fully loaded!');
