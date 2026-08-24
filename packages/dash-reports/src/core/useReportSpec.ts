import { useCallback, useEffect, useRef, useState } from 'react';
import { useAxios } from 'dash-axios-hook';
import type { ReportSpec } from './types';

/**
 * Fetch a report's spec.
 *
 * Single-flight per key: React 18 StrictMode double-invokes effects in
 * development, and without the guard every report page would fire its spec
 * request twice on mount. The in-flight promise is shared rather than the
 * second call being dropped, so both callers still resolve.
 */
const inFlight = new Map<string, Promise<ReportSpec>>();

export interface UseReportSpecResult {
  spec: ReportSpec | null;
  loading: boolean;
  error: Error | null;
  reload: () => void;
}

export function useReportSpec(reportKey: string): UseReportSpecResult {
  const axios = useAxios();
  // See useReportList: useAxios() is unmemoized and must stay out of deps.
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [spec, setSpec] = useState<ReportSpec | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [nonce, setNonce] = useState(0);

  // Survives unmount-during-fetch without setting state on a dead component.
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!reportKey) return;

    setLoading(true);
    setError(null);

    const cacheKey = `${reportKey}:${nonce}`;

    let promise = inFlight.get(cacheKey);
    if (!promise) {
      promise = axiosRef.current
        .get(`report/${encodeURIComponent(reportKey)}/spec`)
        .then((response: { data: ReportSpec }) => response.data)
        .finally(() => {
          inFlight.delete(cacheKey);
        });
      inFlight.set(cacheKey, promise);
    }

    promise
      .then((data) => {
        if (alive.current) setSpec(data);
      })
      .catch((e: Error) => {
        if (alive.current) setError(e);
      })
      .finally(() => {
        if (alive.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return { spec, loading, error, reload };
}

export default useReportSpec;
