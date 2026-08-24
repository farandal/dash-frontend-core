import { useEffect, useRef, useState } from 'react';
import { useAxios } from 'dash-axios-hook';
import type { ReportListEntry } from './types';

/**
 * Every report this caller may see.
 *
 * The backend has already filtered by role, so whatever comes back is safe to
 * render as a menu.
 */
/**
 * useAxios() builds a NEW axios instance on every render (dash-axios-hook calls
 * axios.create() unmemoized), so it must never appear in a dependency array:
 * a fresh reference each render re-fires the effect, which sets state, which
 * re-renders — an unbroken request loop against the API. The instance is held
 * in a ref instead, and the effect depends only on values that are stable by
 * value.
 */
export function useReportList() {
  const axios = useAxios();
  const axiosRef = useRef(axios);
  axiosRef.current = axios;
  const [reports, setReports] = useState<ReportListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let alive = true;

    axiosRef.current
      .get('report')
      .then((response: { data: { data: ReportListEntry[] } }) => {
        if (alive) setReports(response.data?.data ?? []);
      })
      .catch((e: Error) => {
        if (alive) setError(e);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { reports, loading, error };
}

export default useReportList;
