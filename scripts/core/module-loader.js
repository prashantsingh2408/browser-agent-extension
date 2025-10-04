/**
 * Module Loader
 * Handles dynamic loading of modules with dependency management
 */

class ModuleLoader {
  constructor() {
    this.modules = new Map();
    this.loading = new Map();
    this.basePath = '/scripts/';
  }

  /**
   * Load a module
   * @param {string} modulePath - Path to module relative to scripts folder
   * @returns {Promise<any>} Module exports
   */
  async load(modulePath) {
    // Check if already loaded
    if (this.modules.has(modulePath)) {
      return this.modules.get(modulePath);
    }

    // Check if currently loading (avoid duplicates)
    if (this.loading.has(modulePath)) {
      return this.loading.get(modulePath);
    }

    // Start loading
    const loadPromise = this._loadModule(modulePath);
    this.loading.set(modulePath, loadPromise);

    try {
      const module = await loadPromise;
      this.modules.set(modulePath, module);
      this.loading.delete(modulePath);
      return module;
    } catch (error) {
      this.loading.delete(modulePath);
      console.error(`Failed to load module: ${modulePath}`, error);
      throw error;
    }
  }

  /**
   * Load multiple modules in parallel
   * @param {string[]} modulePaths - Array of module paths
   * @returns {Promise<any[]>} Array of module exports
   */
  async loadMultiple(modulePaths) {
    return Promise.all(modulePaths.map(path => this.load(path)));
  }

  /**
   * Load module with dependencies
   * @param {string} modulePath - Module to load
   * @param {string[]} dependencies - Dependencies to load first
   */
  async loadWithDependencies(modulePath, dependencies = []) {
    // Load dependencies first
    if (dependencies.length > 0) {
      await this.loadMultiple(dependencies);
    }

    // Load main module
    return this.load(modulePath);
  }

  /**
   * Internal module loading
   */
  async _loadModule(modulePath) {
    try {
      // Try ES6 import first
      if (this._supportsESModules()) {
        const fullPath = `${this.basePath}${modulePath}`;
        return await import(fullPath);
      }

      // Fallback to script tag loading
      return await this._loadViaScript(modulePath);
    } catch (error) {
      console.error(`Failed to load module ${modulePath}:`, error);
      throw error;
    }
  }

  /**
   * Load module via script tag (for non-module browsers)
   */
  _loadViaScript(modulePath) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `${this.basePath}${modulePath}`;
      script.type = 'text/javascript';

      script.onload = () => {
        // Module should expose itself via window
        const moduleName = this._getModuleName(modulePath);
        resolve(window[moduleName]);
      };

      script.onerror = () => {
        reject(new Error(`Failed to load script: ${modulePath}`));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Check if browser supports ES modules
   */
  _supportsESModules() {
    try {
      new Function('import("")');
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get module name from path
   */
  _getModuleName(modulePath) {
    return modulePath
      .split('/').pop()
      .replace(/\.js$/, '')
      .split('-')
      .map((word, i) => i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  /**
   * Preload modules
   */
  async preload(modulePaths) {
    console.log(`Preloading ${modulePaths.length} modules...`);
    await this.loadMultiple(modulePaths);
    console.log('Preload complete');
  }

  /**
   * Get loaded module
   */
  get(modulePath) {
    return this.modules.get(modulePath);
  }

  /**
   * Check if module is loaded
   */
  isLoaded(modulePath) {
    return this.modules.has(modulePath);
  }

  /**
   * Unload a module
   */
  unload(modulePath) {
    this.modules.delete(modulePath);
  }

  /**
   * Clear all modules
   */
  clear() {
    this.modules.clear();
    this.loading.clear();
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      loaded: this.modules.size,
      loading: this.loading.size,
      modules: Array.from(this.modules.keys())
    };
  }
}

// Create singleton
const moduleLoader = new ModuleLoader();

// Expose globally
if (typeof window !== 'undefined') {
  window.ModuleLoader = moduleLoader;
}

export default moduleLoader;




