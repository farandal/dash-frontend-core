import { useEffect, useRef, useState } from 'react';
import { useAxios } from 'dash-axios-hook';
import type { Granularity, ReportResult } from './types';

/**
 * A small series for one report's list-page card.
 *
 * One request per card, fired in parallel and failing independently — a report
 * whose preview errors shows a card without a chart rather than blanking the
 * list. The engine this replaces fetched every report's full dataset plus one
 * request per chart type before the index rendered at all (2N requests to draw
 * a page nobody had chosen anything on yet); this is N cheap ones, at a coarse
 * grain, and only for what is on screen.
 */
export function useReportPreview(
  reportKey: string,
  granularity: Granularity,
  rangeDays: number,
  enabled = true,
) {
  const axios = useAxios();
  // See useReportList: useAxios() is unmemoized and must stay out of deps.
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [result, setResult] = useState<ReportResult | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !reportKey) return;

    let alive = true;

    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (rangeDays || 30));

    setLoading(true);

    axiosRef.current
      .get(`report/${encodeURIComponent(reportKey)}/series`, {
        params: {
          start: start.toISOString().slice(0, 10),
          end: end.toISOString().slice(0, 10),
          granularity,
        },
      })
      .then((response: { data: ReportResult }) => {
        if (alive) setResult(response.data);
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
  }, [reportKey, granularity, rangeDays, enabled]);

  return { result, loading, error };
}

export default useReportPreview;
