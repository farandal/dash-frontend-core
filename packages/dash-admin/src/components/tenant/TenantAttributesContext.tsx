import { useAxios } from "dash-axios-hook";
import { createContext, useState, useRef, useEffect, useContext } from "react";

// --- IndexedDB Utility ---
const DB_NAME = "TenantAttributesCacheDB";
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

// --- Context and Provider for memoizing attributes formats ---
const TenantAttributesFormatsContext = createContext<{
  formats: any;
  fetchFormats: () => Promise<void>;
  loading: boolean;
}>({
  formats: null,
  fetchFormats: async () => {},
  loading: false,
});

export const TenantAttributesFormatsProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const axios = useAxios();
  // Use global formats if available or initialize with null
  const [formats, setFormats] = useState<any>(GLOBAL_FORMATS);
  const [loading, setLoading] = useState<boolean>(!!GLOBAL_FETCH_PROMISE);
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
        LAST_FETCH_TIME = await idbGet("tenant_attributes_cache") || 0;
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
        console.log("FETCHING ATTRIBUTES FORMATS");
        const { data } = await axios.get('system/tenant/systemAttributeFormats');
        const formatsData = data.data?.attribute_formats || data.data;
        
        // Update global state
        GLOBAL_FORMATS = formatsData;
        LAST_FETCH_TIME = Date.now();
        
        // Update component state
        setFormats(formatsData);
        
        // Cache in IndexedDB
        try {
          await idbSet("tenant_attributes_cache", LAST_FETCH_TIME);
          await idbSet("tenant_attributes_formats", formatsData);
        } catch (error) {
          console.error("Error writing to IndexedDB:", error);
        }
      } catch (error) {
        console.error("Error fetching attributes formats:", error);
      } finally {
        setLoading(false);
        // Clear the global promise so future calls can initiate new fetches
        GLOBAL_FETCH_PROMISE = null;
      }
    })();
    
    return GLOBAL_FETCH_PROMISE;
  };
  
  useEffect(() => {
    const loadCachedFormats = async () => {
      try {
        // Try to load from IndexedDB first
        if (!GLOBAL_FORMATS) {
          const cachedFormats = await idbGet("tenant_attributes_formats");
          if (cachedFormats) {
            GLOBAL_FORMATS = cachedFormats;
            setFormats(cachedFormats);
            setLoading(false);
          }
        }
        // Always fetch if not recently fetched
        await fetchFormats();
      } catch (error) {
        console.error("Error loading cached formats:", error);
        // Fallback to fetching
        await fetchFormats();
      }
    };
    loadCachedFormats();
    // eslint-disable-next-line
  }, []);
  
  useEffect(() => {
    if (formats) {
      setLoading(false);
    }
  }, [formats]);
  
  return (
    <TenantAttributesFormatsContext.Provider value={{ formats, fetchFormats, loading }}>
      {children}
    </TenantAttributesFormatsContext.Provider>
  );
};

export function useTenantAttributesFormats() {
  return useContext(TenantAttributesFormatsContext);
}
