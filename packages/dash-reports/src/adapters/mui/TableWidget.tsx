import { useMemo } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Typography, useTheme,
} from '@mui/material';
import { formatBucketLong } from '../../core/formatBucket';
import { label as renderLabel } from '../../core/label';
import type { VisualizationProps } from '../../core/visualizationRegistry';

/**
 * The series as numbers.
 *
 * Not optional decoration. Three of the light-mode series hues sit below 3:1
 * contrast against a light surface, which is permitted only where a
 * non-colour path to every value exists — this is that path. It is also the
 * answer to "a tooltip is the only way to read a value".
 *
 * Figures are tabular here, unlike the KPI tile: in a column of numbers,
 * equal-width digits are what makes magnitudes line up and scan.
 */
export function SeriesTableWidget({ result, translate }: VisualizationProps) {
  const theme = useTheme();

  const rows = useMemo(
    () => result.buckets.map((bucket, index) => ({
      bucket: formatBucketLong(bucket, result.granularity, translate),
      values: result.series.map((s) => s.data[index]),
    })),
    [result, translate],
  );

  return (
    <TableContainer sx={{ maxHeight: 420 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: theme.palette.text.secondary }}>
              {translate('dash_reports.table.period', { _: 'Period' })}
            </TableCell>
            {result.series.map((s) => (
              <TableCell key={s.key} align="right" sx={{ color: theme.palette.text.secondary }}>
                {renderLabel(translate, s.label, s.labelText)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.bucket} hover>
              <TableCell sx={{ color: theme.palette.text.primary }}>{row.bucket}</TableCell>
              {row.values.map((value, i) => (
                <TableCell
                  key={i}
                  align="right"
                  sx={{ color: theme.palette.text.primary, fontVariantNumeric: 'tabular-nums' }}
                >
                  {value === null || value === undefined ? '—' : value.toLocaleString()}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export interface DetailTableProps {
  page: {
    data: Array<Record<string, unknown>>;
    total: number;
    page: number;
    perPage: number;
  } | null;
  loading: boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  translate: (key: string, options?: Record<string, unknown>) => string;
}

/** The paginated source rows behind the chart. */
export function DetailTable({ page, loading, currentPage, onPageChange, translate }: DetailTableProps) {
  const theme = useTheme();
  const rows = page?.data ?? [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];

  if (!loading && rows.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          {translate('dash_reports.no_rows', { _: 'No rows for this range.' })}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer sx={{ maxHeight: 420 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column} sx={{ color: theme.palette.text.secondary, whiteSpace: 'nowrap' }}>
                  {translate(`dash_reports.columns.${column}`, { _: column })}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} hover>
                {columns.map((column) => (
                  <TableCell key={column} sx={{ color: theme.palette.text.primary, whiteSpace: 'nowrap' }}>
                    {formatCell(row[column])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={page?.total ?? 0}
        page={Math.max(0, currentPage - 1)}
        onPageChange={(_, next) => onPageChange(next + 1)}
        rowsPerPage={page?.perPage ?? 50}
        rowsPerPageOptions={[page?.perPage ?? 50]}
      />
    </Box>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? '✓' : '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

export default SeriesTableWidget;
