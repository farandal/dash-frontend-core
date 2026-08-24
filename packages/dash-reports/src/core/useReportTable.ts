import { useEffect, useRef, useState } from 'react';
import { useAxios } from 'dash-axios-hook';
import { toQueryParams } from './queryParams';
import type { ReportFilterState, ReportTablePage } from './types';

export interface UseReportTableResult {
  page: ReportTablePage | null;
  loading: boolean;
  error: Error | null;
  setPage: (page: number) => void;
  currentPage: number;
}

/**
 * The paginated detail rows behind a report.
 *
 * `enabled` exists because the table is usually behind a toggle: fetching
 * detail rows for a report nobody has expanded is a wasted query on every
 * filter change, and these are the widest rows the endpoint serves.
 */
export function useReportTable(
  reportKey: string,
  filters: ReportFilterState | null,
  enabled = true,
  perPage = 50,
): UseReportTableResult {
  const axios = useAxios();
  // See useReportList: useAxios() is unmemoized and must stay out of deps.
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [page, setPageData] = useState<ReportTablePage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setPage] = useState(1);

  const sequence = useRef(0);

  // A filter change invalidates the page number: page 7 of the old result set
  // is meaningless against the new one, and often past its end.
  useEffect(() => {
    setPage(1);
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (!enabled || !reportKey || !filters) return;

    const ticket = ++sequence.current;
    setLoading(true);
    setError(null);

    axiosRef.current
      .get(`report/${encodeURIComponent(reportKey)}/table`, {
        params: { ...toQueryParams(filters), page: currentPage, perPage },
      })
      .then((response: { data: ReportTablePage }) => {
        if (ticket === sequence.current) setPageData(response.data);
      })
      .catch((e: Error) => {
        if (ticket === sequence.current) setError(e);
      })
      .finally(() => {
        if (ticket === sequence.current) setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey, JSON.stringify(filters), enabled, currentPage, perPage]);

  return { page, loading, error, setPage, currentPage };
}

export default useReportTable;
