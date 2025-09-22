// Network configuration for Firebase operations
export const NETWORK_CONFIG = {
  // Retry configuration
  MAX_RETRIES: 3,
  BASE_DELAY: 1000,
  MAX_DELAY: 10000,
  
  // Timeout configuration
  AUTH_TIMEOUT: 15000, // 15 seconds
  FIRESTORE_TIMEOUT: 10000, // 10 seconds
  
  // Network check configuration
  NETWORK_CHECK_INTERVAL: 30000, // 30 seconds
  NETWORK_CHECK_URL: 'https://www.google.com/favicon.ico',
  
  // Offline mode configuration
  ENABLE_OFFLINE_MODE: true,
  OFFLINE_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  
  // Firebase specific settings
  FIREBASE_SETTINGS: {
    ignoreUndefinedProperties: true,
    experimentalAutoDetectLongPolling: true,
    useFetchStreams: false,
    localCache: {
      kind: 'persistent',
      cacheSizeBytes: 50 * 1024 * 1024, // 50MB cache
      tabManager: {
        kind: 'persistent'
      }
    }
  }
};

// Network status types
export type NetworkStatus = 'online' | 'offline' | 'checking' | 'unknown';

// Network status manager
class NetworkStatusManager {
  private status: NetworkStatus = 'unknown';
  private listeners: ((status: NetworkStatus) => void)[] = [];
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Listen to browser online/offline events
      window.addEventListener('online', () => this.setStatus('online'));
      window.addEventListener('offline', () => this.setStatus('offline'));
      
      // Start periodic network checks
      this.startPeriodicCheck();
    }
  }

  private setStatus(status: NetworkStatus) {
    if (this.status !== status) {
      this.status = status;
      this.listeners.forEach(listener => listener(status));
    }
  }

  public getStatus(): NetworkStatus {
    return this.status;
  }

  public addListener(listener: (status: NetworkStatus) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private async checkNetwork(): Promise<boolean> {
    try {
      const response = await fetch(NETWORK_CONFIG.NETWORK_CHECK_URL, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  private async startPeriodicCheck() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      const isOnline = await this.checkNetwork();
      this.setStatus(isOnline ? 'online' : 'offline');
    }, NETWORK_CONFIG.NETWORK_CHECK_INTERVAL);

    // Initial check
    const isOnline = await this.checkNetwork();
    this.setStatus(isOnline ? 'online' : 'offline');
  }

  public destroy() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners = [];
  }
}

// Export singleton instance
export const networkStatusManager = new NetworkStatusManager();

// Utility functions
export const isOnline = (): boolean => {
  return networkStatusManager.getStatus() === 'online';
};

export const isOffline = (): boolean => {
  return networkStatusManager.getStatus() === 'offline';
};

export const waitForOnline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOnline()) {
      resolve();
      return;
    }

    const unsubscribe = networkStatusManager.addListener((status) => {
      if (status === 'online') {
        unsubscribe();
        resolve();
      }
    });
  });
};

export const waitForOffline = (): Promise<void> => {
  return new Promise((resolve) => {
    if (isOffline()) {
      resolve();
      return;
    }

    const unsubscribe = networkStatusManager.addListener((status) => {
      if (status === 'offline') {
        unsubscribe();
        resolve();
      }
    });
  });
};
