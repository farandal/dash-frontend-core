import { useAxios } from "dash-axios-hook";
import { createContext, useContext, useState, useRef, useEffect } from "react";

// --- IndexedDB Utility ---
const DB_NAME = "SystemRequestsCacheDB";
const STORE_NAME = "kvstore";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function idbSet(key: string, value: any) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(value, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function idbGet(key: string) {
  const db = await openDB();
  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// Debug flag for logging
const DEBUG_SYSTEM_REQUESTS_CACHE = true;

// --- Context for generic system requests cache ---
interface SystemRequestsCacheContextValue {
  formats: any;
  fetchFormats: () => Promise<void>;
  loading: boolean;
}
const SystemRequestsCacheContext = createContext<SystemRequestsCacheContextValue>({
  formats: null,
  fetchFormats: async () => {},
  loading: false,
});

interface SystemRequestsCacheProviderProps {
  cacheKey: string;
  apiUrl: string;
  cacheSeconds?: number;
  children: React.ReactNode;
}

/**
 * SystemRequestsCacheProvider
 * 
 * Usage:
 * <SystemRequestsCacheProvider
 *   cacheKey="system_available_permissions_cache"
 *   apiUrl="system/permission/availablePermissions"
 *   cacheSeconds={10}
 * >
 *   ...children...
 * </SystemRequestsCacheProvider>
 */
export const SystemRequestsCacheProvider: React.FC<SystemRequestsCacheProviderProps> = ({
  cacheKey,
  apiUrl,
  cacheSeconds = 10,
  children
}) => {
  const axios = useAxios();
  const GLOBALS = useRef({
    fetchPromise: null as Promise<any> | null,
    formats: null as any,
    lastFetchTime: 0
  });

  const [formats, setFormats] = useState<any>(GLOBALS.current.formats);
  const [loading, setLoading] = useState<boolean>(!GLOBALS.current.formats && !GLOBALS.current.fetchPromise);

  const fetchFormats = async () => {
    if (DEBUG_SYSTEM_REQUESTS_CACHE) {
      console.log(`[SystemRequestsCache] fetchFormats called for key=${cacheKey}, url=${apiUrl}`);
    }
    if (GLOBALS.current.fetchPromise) {
      if (DEBUG_SYSTEM_REQUESTS_CACHE) {
        console.log(`[SystemRequestsCache] fetchPromise already in progress for key=${cacheKey}`);
      }
      return GLOBALS.current.fetchPromise;
    }

    const now = Date.now();
    if (!GLOBALS.current.lastFetchTime) {
      try {
        GLOBALS.current.lastFetchTime = await idbGet(cacheKey) || 0;
        if (DEBUG_SYSTEM_REQUESTS_CACHE) {
          console.log(`[SystemRequestsCache] Loaded lastFetchTime from IndexedDB: ${GLOBALS.current.lastFetchTime}`);
        }
      } catch (error) {
        if (DEBUG_SYSTEM_REQUESTS_CACHE) {
          console.error(`[SystemRequestsCache] Error reading lastFetchTime from IndexedDB:`, error);
        }
      }
    }

    if (GLOBALS.current.formats && now - GLOBALS.current.lastFetchTime < cacheSeconds * 1000) {
      if (DEBUG_SYSTEM_REQUESTS_CACHE) {
        console.log(`[SystemRequestsCache] Using cached formats for key=${cacheKey} (age: ${(now - GLOBALS.current.lastFetchTime) / 1000}s)`);
      }
      if (!formats) setFormats(GLOBALS.current.formats);
      return;
    }

    setLoading(true);

    GLOBALS.current.fetchPromise = (async () => {
      try {
        if (DEBUG_SYSTEM_REQUESTS_CACHE) {
          console.log(`[SystemRequestsCache] FETCHING ${apiUrl} for key=${cacheKey}`);
        }
        const { data } = await axios.get(apiUrl);

        GLOBALS.current.formats = data;
        GLOBALS.current.lastFetchTime = Date.now();

        setFormats(data);

        try {
          await idbSet(cacheKey, GLOBALS.current.lastFetchTime);
          await idbSet(`${cacheKey}_formats`, data);
          if (DEBUG_SYSTEM_REQUESTS_CACHE) {
            console.log(`[SystemRequestsCache] Saved formats and lastFetchTime to IndexedDB for key=${cacheKey}`);
          }
        } catch (error) {
          if (DEBUG_SYSTEM_REQUESTS_CACHE) {
            console.error(`[SystemRequestsCache] Error writing to IndexedDB:`, error);
          }
        }
      } catch (error) {
        if (DEBUG_SYSTEM_REQUESTS_CACHE) {
          console.error(`[SystemRequestsCache] Error fetching settings formats:`, error);
        }
      } finally {
        setLoading(false);
        GLOBALS.current.fetchPromise = null;
        if (DEBUG_SYSTEM_REQUESTS_CACHE) {
          console.log(`[SystemRequestsCache] fetchPromise cleared for key=${cacheKey}`);
        }
      }
    })();

    return GLOBALS.current.fetchPromise;
  };

  useEffect(() => {
    const loadCachedFormats = async () => {
      if (DEBUG_SYSTEM_REQUESTS_CACHE) {
        console.log(`[SystemRequestsCache] loadCachedFormats for key=${cacheKey}`);
      }
      try {
        if (!GLOBALS.current.formats) {
          const cachedFormats = await idbGet(`${cacheKey}_formats`);
          if (cachedFormats) {
            GLOBALS.current.formats = cachedFormats;
            setFormats(cachedFormats);
            setLoading(false);
            if (DEBUG_SYSTEM_REQUESTS_CACHE) {
              console.log(`[SystemRequestsCache] Loaded formats from IndexedDB for key=${cacheKey}`);
            }
          }
        }
        if (!GLOBALS.current.formats) setLoading(true);
        await fetchFormats();
      } catch (error) {
        if (DEBUG_SYSTEM_REQUESTS_CACHE) {
          console.error(`[SystemRequestsCache] Error loading cached formats:`, error);
        }
        setLoading(true);
        await fetchFormats();
      }
    };
    loadCachedFormats();
    // eslint-disable-next-line
  }, [cacheKey, apiUrl, cacheSeconds]);

  useEffect(() => {
    if (formats) setLoading(false);
  }, [formats]);

  return (
    <SystemRequestsCacheContext.Provider value={{
      formats: (formats || GLOBALS.current.formats) ?? null,
      fetchFormats,
      loading
    }}>
      {children}
    </SystemRequestsCacheContext.Provider>
  );
};

// Hook is now parameterless, just reads from context
export function useSystemRequestsCache() {
  return useContext(SystemRequestsCacheContext);
}

export default SystemRequestsCacheProvider;