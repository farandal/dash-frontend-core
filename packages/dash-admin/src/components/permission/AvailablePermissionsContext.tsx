import { useAxios } from "dash-axios-hook";
import { createContext, useState, useRef, useEffect, useContext } from "react";

// --- IndexedDB Utility ---
const DB_NAME = "SystemSettingsCacheDB";
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

// Global request tracking to prevent multiple requests across component instances
let GLOBAL_FETCH_PROMISE: Promise<any> | null = null;
let GLOBAL_FORMATS: any = null;
let LAST_FETCH_TIME = 0;

// --- Context and Provider for memoizing available permissions formats ---
const AvailablePermissionsFormatsContext = createContext<{
  formats: any;
  fetchFormats: () => Promise<void>;
  loading: boolean;
}>({
  formats: null,
  fetchFormats: async () => {},
  loading: false,
});

export const AvailablePermissionsContext: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const axios = useAxios();
  const [formats, setFormats] = useState<any>(GLOBAL_FORMATS);
  const [loading, setLoading] = useState<boolean>(!GLOBAL_FORMATS && !GLOBAL_FETCH_PROMISE);
  const [initialized, setInitialized] = useState<boolean>(!!LAST_FETCH_TIME);
  
  const fetchFormats = async () => {
  
    // If there's already a global fetch in progress, return that promise
    if (GLOBAL_FETCH_PROMISE) {
      return GLOBAL_FETCH_PROMISE;
    }
    
    // Check if we recently fetched (within 10 seconds)
    const now = Date.now();
    if (!LAST_FETCH_TIME) {
      try {
        // Try to get last fetch time from IndexedDB
        LAST_FETCH_TIME = await idbGet("system_available_permissions_cache") || 0;
      } catch (error) {
        console.error("Error reading from IndexedDB:", error);
      }
    }
    
    // Return early if we have formats and fetched recently
    if (GLOBAL_FORMATS && now - LAST_FETCH_TIME < 10000) {
      if (!formats) {
        setFormats(GLOBAL_FORMATS);
      }
      return;
    }
    
    // Start a new fetch
    setLoading(true);
    
    // Create global fetch promise and store it
    GLOBAL_FETCH_PROMISE = (async () => {
      try {
        console.log("FETCHING AVAILABLE PERMISSIONS");
        const { data } = await axios.get('system/permission/availablePermissions');

        
        // Update global state
        GLOBAL_FORMATS = data;
        LAST_FETCH_TIME = Date.now();
        
        // Update component state
        setFormats(data);
        setInitialized(true);
        
        // Update IndexedDB
        try {
          await idbSet("system_available_permissions_cache", LAST_FETCH_TIME);
          await idbSet("system_available_permissions_formats", data);
        } catch (error) {
          console.error("Error writing to IndexedDB:", error);
        }
      } catch (error) {
        console.error("Error fetching settings formats:", error);
      } finally {
        setLoading(false);
        GLOBAL_FETCH_PROMISE = null;
      }
    })();
    
    return GLOBAL_FETCH_PROMISE;
  };

  // Initialize on mount
  useEffect(() => {
    const loadCachedFormats = async () => {
      
      try {
        if (!GLOBAL_FORMATS) {
          const cachedFormats = await idbGet("system_available_permissions_formats");
          if (cachedFormats) {
            GLOBAL_FORMATS = cachedFormats;
            setFormats(cachedFormats);
            setLoading(false); // <-- Set loading to false if cache is found
          }
        }
        // If still no formats, set loading to true and fetch
        if (!GLOBAL_FORMATS) setLoading(true);
        await fetchFormats();
      } catch (error) {
        console.error("Error loading cached formats:", error);
        setLoading(true);
        await fetchFormats();
      }
    };
    loadCachedFormats();
    // eslint-disable-next-line
  }, []);

  // If formats are set (from fetch or cache), ensure loading is false
  useEffect(() => {

    if (formats) setLoading(false);
  }, [formats]);

  return (
    <AvailablePermissionsFormatsContext.Provider value={{ 
      formats: (formats || GLOBAL_FORMATS) ?? null,
      fetchFormats, 
      loading 
    }}>
      {children}
    </AvailablePermissionsFormatsContext.Provider>
  );
};

// Correct hook name for consumers
export const useAvailablePermissionsFormats = () => {
  const ctx = useContext(AvailablePermissionsFormatsContext);
  return ctx;
};

export default AvailablePermissionsContext