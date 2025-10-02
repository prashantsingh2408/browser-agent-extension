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
  console.log('Creating sample memories...');
  
  const samples = [
    {
      title: 'Project Deadline',
      content: 'The new website redesign project is due this Friday, October 6th. Need to complete final review and testing before submission.',
      category: 'work',
      tags: ['deadline', 'project', 'website']
    },
    {
      title: 'React Hooks Best Practices',
      content: 'Always use hooks at the top level of components. Don\'t call hooks inside loops, conditions, or nested functions. Custom hooks should start with "use".',
      category: 'notes',
      tags: ['react', 'programming', 'javascript']
    },
    {
      title: 'Meeting Notes - Q4 Planning',
      content: 'Team meeting discussed Q4 goals: increase user engagement by 20%, launch mobile app beta, and improve page load times. Action items assigned to dev team.',
      category: 'work',
      tags: ['meeting', 'planning', 'goals']
    },
    {
      title: 'Recipe: Pasta Carbonara',
      content: 'Ingredients: 400g spaghetti, 200g pancetta, 4 eggs, 100g parmesan, black pepper. Cook pasta, fry pancetta, mix eggs with cheese, combine while hot.',
      category: 'personal',
      tags: ['recipe', 'cooking', 'italian']
    },
    {
      title: 'API Authentication Guide',
      content: 'Use OAuth 2.0 for API authentication. Store tokens securely. Implement token refresh mechanism. Use HTTPS for all API calls. Add rate limiting.',
      category: 'notes',
      tags: ['api', 'security', 'development']
    },
    {
      title: 'Vacation Ideas 2025',
      content: 'Potential destinations: Japan (cherry blossoms in April), Iceland (Northern lights), New Zealand (hiking trails). Budget: $3000-4000. Duration: 2 weeks.',
      category: 'personal',
      tags: ['travel', 'vacation', 'planning']
    },
    {
      title: 'Git Commands Cheatsheet',
      content: 'Common commands: git status, git add ., git commit -m "message", git push origin main, git pull, git checkout -b new-branch, git merge branch-name.',
      category: 'notes',
      tags: ['git', 'commands', 'development']
    },
    {
      title: 'Book Recommendations',
      content: 'To read: "Atomic Habits" by James Clear, "Deep Work" by Cal Newport, "Thinking Fast and Slow" by Daniel Kahneman. Focus on productivity and cognitive science.',
      category: 'ideas',
      tags: ['books', 'reading', 'self-improvement']
    }
  ];
  
  for (const sample of samples) {
    createMemory(
      sample.title,
      sample.content,
      sample.category,
      sample.tags,
      'text',
      null,
      {}
    );
  }
  
  await saveMemories();
  console.log(`Created ${samples.length} sample memories`);
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
  
  if (captureSubtab) captureSubtab.style.display = 'none';
  if (searchSubtab) searchSubtab.style.display = 'none';
  if (chatSubtab) chatSubtab.style.display = 'none';
  if (gallerySubtab) gallerySubtab.style.display = 'none';
  
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

// Verify all functions are available
console.log('✅ Memory Agent functions loaded:');
console.log('  - captureScreenshotMemory:', typeof window.captureScreenshotMemory);
console.log('  - recordVideoMemory:', typeof window.recordVideoMemory);
console.log('  - connectGoogleDocs:', typeof window.connectGoogleDocs);
console.log('  - connectGoogleDrive:', typeof window.connectGoogleDrive);
console.log('🧠 Memory Agent script fully loaded!');
