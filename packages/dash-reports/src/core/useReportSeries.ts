import { useEffect, useRef, useState } from 'react';
import { useAxios } from 'dash-axios-hook';
import { toQueryParams } from './queryParams';
import type { ReportFilterState, ReportResult } from './types';

export interface UseReportSeriesResult {
  result: ReportResult | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetch the bucketed series for a report under the current filters.
 *
 * Refetches whenever the filters change, and discards responses that arrive
 * out of order. Without the sequence guard, dragging a date range quickly
 * leaves whichever request happened to finish last on screen, which is not
 * necessarily the one the user is currently looking at.
 */
export function useReportSeries(
  reportKey: string,
  filters: ReportFilterState | null,
): UseReportSeriesResult {
  const axios = useAxios();
  // See useReportList: useAxios() is unmemoized and must stay out of deps.
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sequence = useRef(0);

  useEffect(() => {
    if (!reportKey || !filters) return;

    const ticket = ++sequence.current;
    setLoading(true);
    setError(null);

    axiosRef.current
      .get(`report/${encodeURIComponent(reportKey)}/series`, { params: toQueryParams(filters) })
      .then((response: { data: ReportResult }) => {
        if (ticket === sequence.current) setResult(response.data);
      })
      .catch((e: Error) => {
        if (ticket === sequence.current) setError(e);
      })
      .finally(() => {
        if (ticket === sequence.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey, JSON.stringify(filters)]);

  return { result, loading, error };
}

export default useReportSeries;
