/**
 * Memory Storage Module
 * Handles CRUD operations for memories
 */

import storage from '../../utils/storage.js';
import logger from '../../utils/logger.js';
import eventBus from '../../utils/event-bus.js';

const memoryLogger = logger.createChild('Memory');

// Memory storage
export const memories = new Map();

// Memory categories
export const MEMORY_CATEGORIES = {
  personal: { name: 'Personal', color: '#4285f4', icon: '👤' },
  work: { name: 'Work', color: '#34a853', icon: '💼' },
  ideas: { name: 'Ideas', color: '#fbbc04', icon: '💡' },
  tasks: { name: 'Tasks', color: '#ea4335', icon: '✅' },
  notes: { name: 'Notes', color: '#9c27b0', icon: '📝' }
};

// Memory types
export const MEMORY_TYPES = {
  text: { name: 'Text', icon: '📝', accept: null },
  image: { name: 'Image', icon: '🖼️', accept: 'image/*' },
  audio: { name: 'Audio', icon: '🎵', accept: 'audio/*' },
  video: { name: 'Video', icon: '🎬', accept: 'video/*' },
  screenshot: { name: 'Screenshot', icon: '📸', accept: 'image/*' }
};

/**
 * Load memories from storage
 */
export async function loadMemories() {
  try {
    const data = await storage.get('memories', []);
    memories.clear();
    
    data.forEach(memory => {
      memories.set(memory.id, memory);
    });
    
    memoryLogger.success(`Loaded ${memories.size} memories`);
    eventBus.emit('memory:loaded', { count: memories.size });
    
    return memories;
  } catch (error) {
    memoryLogger.error('Failed to load memories:', error);
    throw error;
  }
}

/**
 * Save memories to storage
 */
export async function saveMemories() {
  try {
    const data = Array.from(memories.values());
    await storage.set('memories', data);
    
    memoryLogger.debug(`Saved ${data.length} memories`);
    eventBus.emit('memory:saved', { count: data.length });
    
    return true;
  } catch (error) {
    memoryLogger.error('Failed to save memories:', error);
    throw error;
  }
}

/**
 * Create a new memory
 */
export function createMemory(title, content, category = 'personal', tags = [], type = 'text', mediaData = null, metadata = {}) {
  const memory = {
    id: generateMemoryId(),
    title,
    content,
    category,
    tags: tags || [],
    type,
    mediaData,
    metadata: {
      ...metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      accessCount: 0,
      lastAccessed: null
    }
  };
  
  memories.set(memory.id, memory);
  saveMemories();
  
  memoryLogger.info('Created memory:', memory.id);
  eventBus.emit('memory:created', memory);
  
  return memory;
}

/**
 * Update an existing memory
 */
export function updateMemory(memoryId, updates) {
  const memory = memories.get(memoryId);
  
  if (!memory) {
    memoryLogger.warn('Memory not found:', memoryId);
    return null;
  }
  
  const updatedMemory = {
    ...memory,
    ...updates,
    metadata: {
      ...memory.metadata,
      ...updates.metadata,
      updatedAt: new Date().toISOString()
    }
  };
  
  memories.set(memoryId, updatedMemory);
  saveMemories();
  
  memoryLogger.info('Updated memory:', memoryId);
  eventBus.emit('memory:updated', updatedMemory);
  
  return updatedMemory;
}

/**
 * Delete a memory
 */
export function deleteMemory(memoryId) {
  const memory = memories.get(memoryId);
  
  if (!memory) {
    memoryLogger.warn('Memory not found:', memoryId);
    return false;
  }
  
  memories.delete(memoryId);
  saveMemories();
  
  memoryLogger.info('Deleted memory:', memoryId);
  eventBus.emit('memory:deleted', { id: memoryId });
  
  return true;
}

/**
 * Get a memory by ID
 */
export function getMemory(memoryId) {
  return memories.get(memoryId);
}

/**
 * Access a memory (updates access count)
 */
export function accessMemory(memoryId) {
  const memory = memories.get(memoryId);
  
  if (!memory) return null;
  
  memory.metadata.accessCount++;
  memory.metadata.lastAccessed = new Date().toISOString();
  
  saveMemories();
  eventBus.emit('memory:accessed', memory);
  
  return memory;
}

/**
 * Get all memories
 */
export function getAllMemories() {
  return Array.from(memories.values());
}

/**
 * Get memories by category
 */
export function getMemoriesByCategory(category) {
  return getAllMemories().filter(m => m.category === category);
}

/**
 * Get memories by type
 */
export function getMemoriesByType(type) {
  return getAllMemories().filter(m => m.type === type);
}

/**
 * Get memories by tags
 */
export function getMemoriesByTags(tags) {
  return getAllMemories().filter(m => 
    tags.some(tag => m.tags.includes(tag))
  );
}

/**
 * Clear all memories
 */
export async function clearAllMemories() {
  memories.clear();
  await storage.remove('memories');
  
  memoryLogger.info('Cleared all memories');
  eventBus.emit('memory:cleared');
  
  return true;
}

/**
 * Generate unique memory ID
 */
function generateMemoryId() {
  return `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Import memories from data
 */
export async function importMemories(data) {
  try {
    let imported = 0;
    
    data.forEach(memoryData => {
      if (memoryData.id && memoryData.title) {
        memories.set(memoryData.id, memoryData);
        imported++;
      }
    });
    
    await saveMemories();
    
    memoryLogger.success(`Imported ${imported} memories`);
    eventBus.emit('memory:imported', { count: imported });
    
    return imported;
  } catch (error) {
    memoryLogger.error('Failed to import memories:', error);
    throw error;
  }
}

/**
 * Export memories to data
 */
export function exportMemories() {
  const data = getAllMemories();
  
  memoryLogger.info(`Exporting ${data.length} memories`);
  eventBus.emit('memory:exported', { count: data.length });
  
  return data;
}

/**
 * Get memory statistics
 */
export function getMemoryStats() {
  const all = getAllMemories();
  
  const stats = {
    total: all.length,
    byCategory: {},
    byType: {},
    totalSize: 0,
    mostAccessed: null,
    recentlyCreated: []
  };
  
  // Count by category
  Object.keys(MEMORY_CATEGORIES).forEach(cat => {
    stats.byCategory[cat] = all.filter(m => m.category === cat).length;
  });
  
  // Count by type
  Object.keys(MEMORY_TYPES).forEach(type => {
    stats.byType[type] = all.filter(m => m.type === type).length;
  });
  
  // Calculate total size
  stats.totalSize = all.reduce((sum, m) => {
    return sum + (m.mediaData ? m.mediaData.length : m.content.length);
  }, 0);
  
  // Find most accessed
  if (all.length > 0) {
    stats.mostAccessed = all.reduce((max, m) => 
      (m.metadata.accessCount > (max?.metadata.accessCount || 0)) ? m : max
    );
  }
  
  // Get recently created (last 5)
  stats.recentlyCreated = all
    .sort((a, b) => new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt))
    .slice(0, 5);
  
  return stats;
}

// Expose globally
if (typeof window !== 'undefined') {
  window.MemoryStorage = {
    memories,
    MEMORY_CATEGORIES,
    MEMORY_TYPES,
    loadMemories,
    saveMemories,
    createMemory,
    updateMemory,
    deleteMemory,
    getMemory,
    accessMemory,
    getAllMemories,
    getMemoriesByCategory,
    getMemoriesByType,
    getMemoriesByTags,
    clearAllMemories,
    importMemories,
    exportMemories,
    getMemoryStats
  };
}

