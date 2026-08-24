import { useCallback, useRef, useState } from 'react';
import { useAxios } from 'dash-axios-hook';
import { toQueryParams } from './queryParams';
import type { ReportFilterState } from './types';

/**
 * Download a report in one of the formats its spec advertises.
 *
 * `responseType: 'blob'` is an AXIOS REQUEST OPTION, not a query parameter.
 * The legacy Stats page put it inside `params`, so it was serialised into the
 * URL as `?responseType=blob` and axios still parsed the response as text —
 * which corrupted the binary and is one reason that export never worked. The
 * distinction is easy to miss because nothing errors; you just get a broken
 * file.
 */
export function useReportExport(reportKey: string) {
  const axios = useAxios();
  // See useReportList: useAxios() is unmemoized and must stay out of deps.
  const axiosRef = useRef(axios);
  axiosRef.current = axios;

  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const exportReport = useCallback(
    async (filters: ReportFilterState, format = 'xlsx') => {
      setExporting(true);
      setError(null);

      try {
        const response = await axiosRef.current.get(`report/${encodeURIComponent(reportKey)}/export`, {
          params: { ...toQueryParams(filters), format },
          responseType: 'blob',
        });

        const blob = new Blob([response.data], {
          type: String(response.headers?.['content-type'] ?? 'application/octet-stream'),
        });

        // Prefer the filename the server chose — it carries the report key and
        // the actual date range, which a client-side guess would drift from.
        const disposition = String(response.headers?.['content-disposition'] ?? '');
        const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
        const filename = match ? decodeURIComponent(match[1]) : `${reportKey}.${format}`;

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        // Revoked on the next tick: revoking synchronously can cancel the
        // download in some browsers before it has read the blob.
        setTimeout(() => URL.revokeObjectURL(url), 0);
      } catch (e) {
        setError(e as Error);
      } finally {
        setExporting(false);
      }
    },
    [reportKey],
  );

  return { exporting, error, exportReport };
}

export default useReportExport;
