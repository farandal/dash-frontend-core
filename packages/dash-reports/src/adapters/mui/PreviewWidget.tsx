import { Box, Skeleton, Stack, Typography, useTheme } from '@mui/material';
import { Bar, Line } from 'react-chartjs-2';
import { ensureChartsRegistered } from './chartSetup';
import { chartChrome } from './chartTheme';
import { buildSlotMap, colorForSlot, MAX_SERIES } from './palette';
import { label as renderLabel } from '../../core/label';
import type { ReportMetric, ReportResult, TranslateFn, VisualizationType } from '../../core/types';

ensureChartsRegistered();

export interface PreviewWidgetProps {
  result: ReportResult | null;
  loading: boolean;
  type: VisualizationType;
  translate: TranslateFn;
  /** From the list payload; without it the card would print raw metric keys. */
  metrics?: ReportMetric[];
}

const PREVIEW_HEIGHT = 96;

/**
 * The card-sized rendering of a report.
 *
 * Deliberately not the full widget shrunk down. At this size axes, legends and
 * gridlines are unreadable ink — so the preview keeps only the shape (or, for a
 * report whose answer is a number, just the number). Everything is stripped:
 * no axes, no legend, no tooltip. Reading a value is what opening the report is
 * for; this is only enough to tell one report from another and see whether
 * anything is happening.
 */
export function PreviewWidget({ result, loading, type, translate, metrics }: PreviewWidgetProps) {
  const theme = useTheme();

  if (loading) {
    return <Skeleton variant="rounded" height={PREVIEW_HEIGHT} sx={{ mt: 1 }} />;
  }

  if (!result || result.series.length === 0) {
    return (
      <Box sx={{ height: PREVIEW_HEIGHT, display: 'grid', placeItems: 'center', mt: 1 }}>
        <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
          {translate('dash_reports.no_data', { _: 'No data for this range.' })}
        </Typography>
      </Box>
    );
  }

  const chrome = chartChrome(theme);

  // Kpi and Funnel both answer with numbers rather than a shape, so at card
  // size they render as figures instead of a chart nobody could read.
  if (type === 'Kpi' || type === 'Funnel') {
    const entries = Object.entries(result.totals).slice(0, 3);

    return (
      <Stack direction="row" sx={{ gap: 2.5, mt: 1.5, minHeight: PREVIEW_HEIGHT, alignItems: 'center', flexWrap: 'wrap' }}>
        {entries.map(([key, value]) => {
          const metric = metrics?.find((m) => m.key === key);

          return (
          <Box key={key}>
            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, display: 'block' }}>
              {metric ? renderLabel(translate, metric.label, metric.labelText) : key}
            </Typography>
            <Typography sx={{ fontSize: '1.35rem', lineHeight: 1.2, color: theme.palette.text.primary }}>
              {value === null || value === undefined ? '—' : value.toLocaleString()}
            </Typography>
          </Box>
          );
        })}
      </Stack>
    );
  }

  const slots = buildSlotMap(null, result.meta?.pivot ?? undefined, result.series.map((s) => s.key));
  const datasets = result.series
    .filter((s) => (slots.get(s.key) ?? 0) < MAX_SERIES)
    .map((s) => ({
      label: s.label,
      data: s.data,
      color: colorForSlot(slots.get(s.key) ?? 0, chrome.dark),
    }));

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    // Every affordance off: at 96px these are ink, not information.
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
    elements: { point: { radius: 0 } },
  };

  const data = {
    labels: result.buckets.map(() => ''),
    datasets: datasets.map((d) => ({
      label: d.label,
      data: d.data,
      backgroundColor: d.color,
      borderColor: d.color,
      borderWidth: type === 'Line' ? 2 : 0,
      borderRadius: 3,
      borderSkipped: 'bottom' as const,
      maxBarThickness: 14,
      tension: 0.3,
      fill: false,
      pointRadius: 0,
    })),
  };

  return (
    <Box sx={{ height: PREVIEW_HEIGHT, mt: 1 }}>
      {type === 'Line'
        ? <Line data={data} options={options} height={PREVIEW_HEIGHT} />
        : <Bar data={data} options={options} height={PREVIEW_HEIGHT} />}
    </Box>
  );
}

export default PreviewWidget;
