/**
 * Memory Search Module
 * Handles search and filtering of memories
 */

import { memories } from './memory-storage.js';
import logger from '../../utils/logger.js';
import eventBus from '../../utils/event-bus.js';

const searchLogger = logger.createChild('MemorySearch');

/**
 * Search memories by query
 */
export function searchMemories(query) {
  if (!query || query.trim() === '') {
    return Array.from(memories.values());
  }
  
  const searchTerm = query.toLowerCase().trim();
  const results = [];
  
  for (const memory of memories.values()) {
    let score = 0;
    
    // Title match (highest weight)
    if (memory.title.toLowerCase().includes(searchTerm)) {
      score += 10;
    }
    
    // Content match
    if (memory.content.toLowerCase().includes(searchTerm)) {
      score += 5;
    }
    
    // Tag match
    if (memory.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      score += 7;
    }
    
    // Category match
    if (memory.category.toLowerCase().includes(searchTerm)) {
      score += 3;
    }
    
    if (score > 0) {
      results.push({ memory, score });
    }
  }
  
  // Sort by score (descending)
  results.sort((a, b) => b.score - a.score);
  
  const foundMemories = results.map(r => r.memory);
  
  searchLogger.debug(`Found ${foundMemories.length} memories for query: "${query}"`);
  eventBus.emit('memory:searched', { query, count: foundMemories.length });
  
  return foundMemories;
}

/**
 * Advanced semantic search (AI-powered if available)
 */
export async function semanticSearchMemories(query) {
  // For now, fall back to regular search
  // TODO: Implement AI-powered semantic search when Chrome AI is available
  
  searchLogger.debug('Performing semantic search:', query);
  
  try {
    // Try to use AI for semantic understanding
    if (window.AIService && window.AIService.hasCapability('languageModel')) {
      // TODO: Implement with embeddings/similarity
      return searchMemories(query);
    }
    
    // Fallback to regular search
    return searchMemories(query);
  } catch (error) {
    searchLogger.error('Semantic search failed:', error);
    return searchMemories(query);
  }
}

/**
 * Filter memories by category
 */
export function filterByCategory(category) {
  if (category === 'all') {
    return Array.from(memories.values());
  }
  
  const filtered = Array.from(memories.values()).filter(m => m.category === category);
  
  searchLogger.debug(`Filtered ${filtered.length} memories for category: ${category}`);
  eventBus.emit('memory:filtered', { category, count: filtered.length });
  
  return filtered;
}

/**
 * Filter memories by type
 */
export function filterByType(type) {
  if (type === 'all') {
    return Array.from(memories.values());
  }
  
  const filtered = Array.from(memories.values()).filter(m => m.type === type);
  
  searchLogger.debug(`Filtered ${filtered.length} memories for type: ${type}`);
  
  return filtered;
}

/**
 * Filter memories by tags
 */
export function filterByTags(tags) {
  if (!tags || tags.length === 0) {
    return Array.from(memories.values());
  }
  
  const filtered = Array.from(memories.values()).filter(m =>
    tags.some(tag => m.tags.includes(tag))
  );
  
  searchLogger.debug(`Filtered ${filtered.length} memories for tags:`, tags);
  
  return filtered;
}

/**
 * Filter memories by date range
 */
export function filterByDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const filtered = Array.from(memories.values()).filter(m => {
    const created = new Date(m.metadata.createdAt);
    return created >= start && created <= end;
  });
  
  searchLogger.debug(`Filtered ${filtered.length} memories for date range`);
  
  return filtered;
}

/**
 * Sort memories
 */
export function sortMemories(memoriesArray, sortBy = 'date', order = 'desc') {
  const sorted = [...memoriesArray];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.metadata.createdAt) - new Date(a.metadata.createdAt);
        break;
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'accessed':
        comparison = b.metadata.accessCount - a.metadata.accessCount;
        break;
      case 'updated':
        comparison = new Date(b.metadata.updatedAt) - new Date(a.metadata.updatedAt);
        break;
      default:
        comparison = 0;
    }
    
    return order === 'asc' ? -comparison : comparison;
  });
  
  return sorted;
}

/**
 * Get related memories
 */
export function findRelatedMemories(memoryId, limit = 5) {
  const memory = memories.get(memoryId);
  
  if (!memory) {
    searchLogger.warn('Memory not found for finding related:', memoryId);
    return [];
  }
  
  const related = [];
  
  for (const otherMemory of memories.values()) {
    if (otherMemory.id === memoryId) continue;
    
    let score = 0;
    
    // Same category
    if (otherMemory.category === memory.category) {
      score += 3;
    }
    
    // Common tags
    const commonTags = memory.tags.filter(tag => otherMemory.tags.includes(tag));
    score += commonTags.length * 5;
    
    // Similar time (within 24 hours)
    const timeDiff = Math.abs(
      new Date(memory.metadata.createdAt) - new Date(otherMemory.metadata.createdAt)
    );
    if (timeDiff < 24 * 60 * 60 * 1000) {
      score += 2;
    }
    
    if (score > 0) {
      related.push({ memory: otherMemory, score });
    }
  }
  
  // Sort by score and limit
  related.sort((a, b) => b.score - a.score);
  const results = related.slice(0, limit).map(r => r.memory);
  
  searchLogger.debug(`Found ${results.length} related memories`);
  
  return results;
}

/**
 * Get all unique tags
 */
export function getAllTags() {
  const tagSet = new Set();
  
  for (const memory of memories.values()) {
    memory.tags.forEach(tag => tagSet.add(tag));
  }
  
  return Array.from(tagSet).sort();
}

/**
 * Get popular tags (by usage count)
 */
export function getPopularTags(limit = 10) {
  const tagCounts = new Map();
  
  for (const memory of memories.values()) {
    memory.tags.forEach(tag => {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    });
  }
  
  return Array.from(tagCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag, count]) => ({ tag, count }));
}

/**
 * Combined filter and search
 */
export function advancedSearch(options = {}) {
  let results = Array.from(memories.values());
  
  // Apply category filter
  if (options.category && options.category !== 'all') {
    results = results.filter(m => m.category === options.category);
  }
  
  // Apply type filter
  if (options.type && options.type !== 'all') {
    results = results.filter(m => m.type === options.type);
  }
  
  // Apply tags filter
  if (options.tags && options.tags.length > 0) {
    results = results.filter(m =>
      options.tags.some(tag => m.tags.includes(tag))
    );
  }
  
  // Apply date range filter
  if (options.startDate && options.endDate) {
    const start = new Date(options.startDate);
    const end = new Date(options.endDate);
    results = results.filter(m => {
      const created = new Date(m.metadata.createdAt);
      return created >= start && created <= end;
    });
  }
  
  // Apply search query
  if (options.query) {
    const query = options.query.toLowerCase();
    results = results.filter(m =>
      m.title.toLowerCase().includes(query) ||
      m.content.toLowerCase().includes(query) ||
      m.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Apply sorting
  if (options.sortBy) {
    results = sortMemories(results, options.sortBy, options.order);
  }
  
  // Apply limit
  if (options.limit) {
    results = results.slice(0, options.limit);
  }
  
  searchLogger.debug(`Advanced search returned ${results.length} results`);
  
  return results;
}

// Expose globally
if (typeof window !== 'undefined') {
  window.MemorySearch = {
    searchMemories,
    semanticSearchMemories,
    filterByCategory,
    filterByType,
    filterByTags,
    filterByDateRange,
    sortMemories,
    findRelatedMemories,
    getAllTags,
    getPopularTags,
    advancedSearch
  };
}

