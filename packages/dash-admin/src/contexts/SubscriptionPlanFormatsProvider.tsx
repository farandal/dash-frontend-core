import { useAxios } from "dash-axios-hook";
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { idbSet, idbGet } from "./SystemRequestsCache";

// Debug flag for logging
const DEBUG_SUBSCRIPTION_PLAN_FORMATS = true;

/**
 * SubscriptionPlanFormatsContext
 * 
 * Context specifically designed for subscription plan management that fetches
 * both limit formats and addon formats from the backend API.
 */
interface SubscriptionPlanFormatsContextValue {
    formats: any;           // Limit formats (for backward compatibility)
    addonFormats: any;      // Add-on formats
    loading: boolean;
    fetchFormats: () => Promise<void>;
}

const SubscriptionPlanFormatsContext = createContext<SubscriptionPlanFormatsContextValue>({
    formats: null,
    addonFormats: null,
    loading: false,
    fetchFormats: async () => {},
});

interface SubscriptionPlanFormatsProviderProps {
    cacheSeconds?: number;
    children: React.ReactNode;
}

/**
 * SubscriptionPlanFormatsProvider
 * 
 * Provider that fetches both limit formats and addon formats for subscription plans.
 * Uses IndexedDB for caching to persist data across sessions.
 * 
 * Usage:
 * <SubscriptionPlanFormatsProvider cacheSeconds={300}>
 *   ...children...
 * </SubscriptionPlanFormatsProvider>
 */
export const SubscriptionPlanFormatsProvider: React.FC<SubscriptionPlanFormatsProviderProps> = ({
    cacheSeconds = 300,
    children
}) => {
    const axios = useAxios();
    const CACHE_KEY_LIMITS = "subscription_plan_limit_formats_cache";
    const CACHE_KEY_ADDONS = "subscription_plan_addon_formats_cache";

    const GLOBALS = useRef({
        fetchPromise: null as Promise<any> | null,
        formats: null as any,
        addonFormats: null as any,
        lastFetchTime: 0
    });

    const [formats, setFormats] = useState<any>(GLOBALS.current.formats);
    const [addonFormats, setAddonFormats] = useState<any>(GLOBALS.current.addonFormats);
    const [loading, setLoading] = useState<boolean>(!GLOBALS.current.formats && !GLOBALS.current.fetchPromise);

    const fetchFormats = async () => {
        if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
            console.log(`[SubscriptionPlanFormats] fetchFormats called`);
        }

        if (GLOBALS.current.fetchPromise) {
            if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                console.log(`[SubscriptionPlanFormats] fetchPromise already in progress`);
            }
            return GLOBALS.current.fetchPromise;
        }

        const now = Date.now();
        
        // Check if we have cached data and it's still valid
        if (GLOBALS.current.formats && GLOBALS.current.addonFormats && 
            now - GLOBALS.current.lastFetchTime < cacheSeconds * 1000) {
            if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                console.log(`[SubscriptionPlanFormats] Using cached data (age: ${(now - GLOBALS.current.lastFetchTime) / 1000}s)`);
            }
            if (!formats) setFormats(GLOBALS.current.formats);
            if (!addonFormats) setAddonFormats(GLOBALS.current.addonFormats);
            return;
        }

        setLoading(true);

        GLOBALS.current.fetchPromise = (async () => {
            try {
                if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                    console.log(`[SubscriptionPlanFormats] FETCHING limit formats and addon formats`);
                }

                // Fetch both endpoints in parallel
                const [limitsResponse, addonsResponse] = await Promise.all([
                    axios.get('system/subscription-plan/limitFormats'),
                    axios.get('system/subscription-plan/addonFormats')
                ]);

                GLOBALS.current.formats = limitsResponse.data;
                GLOBALS.current.addonFormats = addonsResponse.data;
                GLOBALS.current.lastFetchTime = Date.now();

                setFormats(limitsResponse.data);
                setAddonFormats(addonsResponse.data);

                // Persist to IndexedDB
                try {
                    await idbSet(`${CACHE_KEY_LIMITS}_formats`, limitsResponse.data);
                    await idbSet(`${CACHE_KEY_ADDONS}_formats`, addonsResponse.data);
                    await idbSet(`subscription_plan_formats_lastFetchTime`, GLOBALS.current.lastFetchTime);
                    if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                        console.log(`[SubscriptionPlanFormats] Saved to IndexedDB`);
                    }
                } catch (error) {
                    if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                        console.error(`[SubscriptionPlanFormats] Error writing to IndexedDB:`, error);
                    }
                }
            } catch (error) {
                if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                    console.error(`[SubscriptionPlanFormats] Error fetching formats:`, error);
                }
            } finally {
                setLoading(false);
                GLOBALS.current.fetchPromise = null;
                if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                    console.log(`[SubscriptionPlanFormats] fetchPromise cleared`);
                }
            }
        })();

        return GLOBALS.current.fetchPromise;
    };

    useEffect(() => {
        const loadCachedFormats = async () => {
            if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                console.log(`[SubscriptionPlanFormats] loadCachedFormats`);
            }
            try {
                // Try to load from IndexedDB first
                if (!GLOBALS.current.formats) {
                    const cachedFormats = await idbGet(`${CACHE_KEY_LIMITS}_formats`);
                    if (cachedFormats) {
                        GLOBALS.current.formats = cachedFormats;
                        setFormats(cachedFormats);
                        if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                            console.log(`[SubscriptionPlanFormats] Loaded limit formats from IndexedDB`);
                        }
                    }
                }
                if (!GLOBALS.current.addonFormats) {
                    const cachedAddonFormats = await idbGet(`${CACHE_KEY_ADDONS}_formats`);
                    if (cachedAddonFormats) {
                        GLOBALS.current.addonFormats = cachedAddonFormats;
                        setAddonFormats(cachedAddonFormats);
                        if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                            console.log(`[SubscriptionPlanFormats] Loaded addon formats from IndexedDB`);
                        }
                    }
                }

                // Load lastFetchTime
                const cachedTime = await idbGet(`subscription_plan_formats_lastFetchTime`);
                if (cachedTime) {
                    GLOBALS.current.lastFetchTime = cachedTime;
                }

                // If we have both cached, check if still valid
                if (GLOBALS.current.formats && GLOBALS.current.addonFormats) {
                    const now = Date.now();
                    if (now - GLOBALS.current.lastFetchTime < cacheSeconds * 1000) {
                        setLoading(false);
                        return; // Cache is still valid
                    }
                }

                // Fetch fresh data
                await fetchFormats();
            } catch (error) {
                if (DEBUG_SUBSCRIPTION_PLAN_FORMATS) {
                    console.error(`[SubscriptionPlanFormats] Error loading cached formats:`, error);
                }
                await fetchFormats();
            }
        };
        loadCachedFormats();
        // eslint-disable-next-line
    }, [cacheSeconds]);

    useEffect(() => {
        if (formats && addonFormats) setLoading(false);
    }, [formats, addonFormats]);

    return (
        <SubscriptionPlanFormatsContext.Provider value={{
            formats: (formats || GLOBALS.current.formats) ?? null,
            addonFormats: (addonFormats || GLOBALS.current.addonFormats) ?? null,
            fetchFormats,
            loading
        }}>
            {children}
        </SubscriptionPlanFormatsContext.Provider>
    );
};

/**
 * Hook to access the subscription plan formats context
 */
export function useSubscriptionPlanFormats() {
    return useContext(SubscriptionPlanFormatsContext);
}

export default SubscriptionPlanFormatsProvider;
