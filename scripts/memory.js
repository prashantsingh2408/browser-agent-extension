// Memory Management System
// Handles personal memory storage, retrieval, and organization

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

// Initialize Memory system
async function initializeMemory() {
  try {
    console.log('Initializing Memory system...');
    
    // Load memories from storage
    await loadMemories();
    
    // Setup event listeners
    setupMemoryEventListeners();
    
    // Render memories
    renderMemories();
    
    console.log('Memory system initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Memory system:', error);
  }
}

// Setup event listeners for memory functionality
function setupMemoryEventListeners() {
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

// Create a new memory
function createMemory(title, content, category = 'personal', tags = []) {
  const memory = {
    id: generateMemoryId(),
    title: title.trim(),
    content: content.trim(),
    category: category,
    tags: tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    accessCount: 0,
    lastAccessed: null
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

// Search memories
function searchMemories(query) {
  if (!query.trim()) return Array.from(memories.values());
  
  const searchTerm = query.toLowerCase();
  return Array.from(memories.values()).filter(memory => 
    memory.title.toLowerCase().includes(searchTerm) ||
    memory.content.toLowerCase().includes(searchTerm) ||
    memory.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
}

// Filter memories by category
function filterMemories(category) {
  if (category === 'all') return Array.from(memories.values());
  return Array.from(memories.values()).filter(memory => memory.category === category);
}

// Handle memory search
function handleMemorySearch(e) {
  searchQuery = e.target.value;
  renderMemories();
}

// Render memories in the UI
function renderMemories() {
  const memoryList = document.getElementById('memoryList');
  const emptyState = document.getElementById('memoryEmptyState');
  
  if (!memoryList) return;
  
  // Get filtered memories
  let filteredMemories = filterMemories(currentFilter);
  
  // Apply search if there's a query
  if (searchQuery.trim()) {
    filteredMemories = searchMemories(searchQuery);
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
  
  const memoryDiv = document.createElement('div');
  memoryDiv.className = 'memory-item';
  memoryDiv.dataset.memoryId = memory.id;
  
  memoryDiv.innerHTML = `
    <div class="memory-header">
      <div class="memory-category" style="background: ${category.color}20; color: ${category.color};">
        <span class="category-icon">${category.icon}</span>
        <span class="category-name">${category.name}</span>
      </div>
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
    <div class="memory-content" onclick="accessMemory('${memory.id}'); expandMemory('${memory.id}')">
      <h4 class="memory-title">${escapeHtml(memory.title)}</h4>
      <p class="memory-text">${escapeHtml(memory.content.substring(0, 200))}${memory.content.length > 200 ? '...' : ''}</p>
      ${memory.tags.length > 0 ? `
        <div class="memory-tags">
          ${memory.tags.map(tag => `<span class="memory-tag">#${escapeHtml(tag)}</span>`).join('')}
        </div>
      ` : ''}
    </div>
    <div class="memory-footer">
      <span class="memory-time">${timeAgo}</span>
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

// Show add memory modal
function showAddMemoryModal(defaultCategory = 'personal') {
  const modal = createAddMemoryModal(defaultCategory);
  document.body.appendChild(modal);
  
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
}

// Create expand memory modal
function createExpandMemoryModal(memory) {
  const category = MEMORY_CATEGORIES[memory.category] || MEMORY_CATEGORIES.personal;
  const timeAgo = getTimeAgo(memory.updatedAt);
  
  const modal = document.createElement('div');
  modal.className = 'memory-modal expand-modal';
  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeExpandMemoryModal()"></div>
    <div class="modal-content">
      <div class="modal-header">
        <div class="memory-category" style="background: ${category.color}20; color: ${category.color};">
          <span class="category-icon">${category.icon}</span>
          <span class="category-name">${category.name}</span>
        </div>
        <button class="modal-close" onclick="closeExpandMemoryModal()">×</button>
      </div>
      <div class="modal-body">
        <h2 class="memory-title">${escapeHtml(memory.title)}</h2>
        <div class="memory-meta">
          <span>Created: ${new Date(memory.createdAt).toLocaleDateString()}</span>
          <span>Updated: ${timeAgo}</span>
          <span>Views: ${memory.accessCount}</span>
        </div>
        ${memory.tags.length > 0 ? `
          <div class="memory-tags">
            ${memory.tags.map(tag => `<span class="memory-tag">#${escapeHtml(tag)}</span>`).join('')}
          </div>
        ` : ''}
        <div class="memory-content-full">
          ${escapeHtml(memory.content).replace(/\n/g, '<br>')}
        </div>
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
